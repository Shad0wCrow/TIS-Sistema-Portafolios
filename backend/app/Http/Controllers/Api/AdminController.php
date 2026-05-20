<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AdminController extends Controller
{
    public function usuarios(Request $request)
    {
        $data = $request->validate([
            'q' => 'sometimes|nullable|string|max:100',
            'estado' => 'sometimes|nullable|in:activos,inhabilitados,todos',
            'rol' => 'sometimes|nullable|string|max:50',
            'per_page' => 'sometimes|integer|min:5|max:100',
        ]);

        $query = DB::table('usuario')
            ->leftJoin('perfil', function ($join) {
                $join->on('perfil.usuario_id', '=', 'usuario.id_usuario')
                    ->where('perfil.eliminado', false);
            })
            ->leftJoin('portafolio_publicacion as publicacion', 'publicacion.usuario_id', '=', 'usuario.id_usuario')
            ->select([
                'usuario.id_usuario',
                'usuario.correo',
                'usuario.nombre_usuario',
                'usuario.rol',
                'usuario.eliminado',
                'usuario.creado_en',
                'perfil.id_perfil',
                'perfil.nombre_perfil',
                'perfil.apellido_perfil',
                'perfil.profesion',
                'perfil.foto_url',
                'publicacion.id_publicacion',
                'publicacion.slug_publico',
                'publicacion.publicado',
                'publicacion.enlace_activo',
                'publicacion.publicado_en',
            ]);

        $busqueda = trim($data['q'] ?? '');
        if ($busqueda !== '') {
            $query->where(function ($subQuery) use ($busqueda) {
                $like = '%' . mb_strtolower($busqueda) . '%';

                $subQuery
                    ->whereRaw('LOWER(usuario.correo) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(usuario.nombre_usuario) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(perfil.nombre_perfil) LIKE ?', [$like])
                    ->orWhereRaw('LOWER(perfil.apellido_perfil) LIKE ?', [$like])
                    ->orWhereRaw("LOWER(TRIM(COALESCE(perfil.nombre_perfil, '') || ' ' || COALESCE(perfil.apellido_perfil, ''))) LIKE ?", [$like]);
            });
        }

        $estado = $data['estado'] ?? 'todos';
        if ($estado === 'activos') {
            $query->where('usuario.eliminado', false);
        } elseif ($estado === 'inhabilitados') {
            $query->where('usuario.eliminado', true);
        }

        if (!empty($data['rol'])) {
            $query->where('usuario.rol', $data['rol']);
        }

        $usuarios = $query
            ->orderBy('usuario.eliminado')
            ->orderByDesc('usuario.creado_en')
            ->paginate($data['per_page'] ?? 15);

        $usuarios->getCollection()->transform(function ($usuario) {
            return [
                'id_usuario' => $usuario->id_usuario,
                'correo' => $usuario->correo,
                'nombre_usuario' => $usuario->nombre_usuario,
                'rol' => $usuario->rol,
                'estado' => $usuario->eliminado ? 'inhabilitado' : 'activo',
                'eliminado' => (bool) $usuario->eliminado,
                'creado_en' => $usuario->creado_en,
                'perfil' => $usuario->id_perfil ? [
                    'id_perfil' => $usuario->id_perfil,
                    'nombre' => trim(($usuario->nombre_perfil ?? '') . ' ' . ($usuario->apellido_perfil ?? '')),
                    'nombre_perfil' => $usuario->nombre_perfil,
                    'apellido_perfil' => $usuario->apellido_perfil,
                    'profesion' => $usuario->profesion,
                    'foto_url' => $usuario->foto_url,
                ] : null,
                'portafolio' => $usuario->id_publicacion ? [
                    'id_publicacion' => $usuario->id_publicacion,
                    'slug_publico' => $usuario->slug_publico,
                    'publicado' => (bool) $usuario->publicado,
                    'enlace_activo' => (bool) $usuario->enlace_activo,
                    'publicado_en' => $usuario->publicado_en,
                ] : null,
            ];
        });

        return response()->json($usuarios);
    }

    public function actualizarEstadoUsuario(Request $request, int $id)
    {
        $data = $request->validate([
            'eliminado' => 'required|boolean',
        ]);

        $admin = $request->user();
        $usuario = Usuario::where('id_usuario', $id)->firstOrFail();
        $inhabilitar = (bool) $data['eliminado'];

        if ((int) $admin->id_usuario === (int) $usuario->id_usuario && $inhabilitar) {
            throw ValidationException::withMessages([
                'usuario' => ['No puedes inhabilitar tu propia cuenta de administrador.'],
            ]);
        }

        if ($usuario->rol === 'admin' && $inhabilitar && $this->esUltimoAdminActivo($usuario)) {
            throw ValidationException::withMessages([
                'usuario' => ['No puedes inhabilitar al último administrador activo.'],
            ]);
        }

        $usuario->update(['eliminado' => $inhabilitar]);

        if ($inhabilitar) {
            PersonalAccessToken::where('tokenable_type', Usuario::class)
                ->where('tokenable_id', $usuario->id_usuario)
                ->delete();
        }

        return response()->json([
            'message' => $inhabilitar ? 'Usuario inhabilitado correctamente.' : 'Usuario habilitado correctamente.',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'correo' => $usuario->correo,
                'nombre_usuario' => $usuario->nombre_usuario,
                'rol' => $usuario->rol,
                'estado' => $usuario->eliminado ? 'inhabilitado' : 'activo',
                'eliminado' => (bool) $usuario->eliminado,
            ],
        ]);
    }

    public function reporteResumen()
    {
        $usuariosBase = DB::table('usuario');

        $topVisualizaciones = DB::table('portafolio_visualizacion_evento as vista')
            ->join('portafolio_publicacion as publicacion', 'publicacion.id_publicacion', '=', 'vista.publicacion_id')
            ->join('usuario', 'usuario.id_usuario', '=', 'publicacion.usuario_id')
            ->leftJoin('perfil', function ($join) {
                $join->on('perfil.usuario_id', '=', 'usuario.id_usuario')
                    ->where('perfil.eliminado', false);
            })
            ->groupBy('publicacion.id_publicacion', 'publicacion.slug_publico', 'usuario.id_usuario', 'usuario.nombre_usuario', 'perfil.nombre_perfil', 'perfil.apellido_perfil', 'perfil.profesion')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->limit(5)
            ->get([
                'publicacion.id_publicacion',
                'publicacion.slug_publico',
                'usuario.id_usuario',
                'usuario.nombre_usuario',
                'perfil.nombre_perfil',
                'perfil.apellido_perfil',
                'perfil.profesion',
                DB::raw('COUNT(*) as total_visualizaciones'),
            ]);

        $topContactos = DB::table('portafolio_contacto_evento as contacto')
            ->join('portafolio_publicacion as publicacion', 'publicacion.id_publicacion', '=', 'contacto.publicacion_id')
            ->join('usuario', 'usuario.id_usuario', '=', 'publicacion.usuario_id')
            ->leftJoin('perfil', function ($join) {
                $join->on('perfil.usuario_id', '=', 'usuario.id_usuario')
                    ->where('perfil.eliminado', false);
            })
            ->groupBy('publicacion.id_publicacion', 'publicacion.slug_publico', 'usuario.id_usuario', 'usuario.nombre_usuario', 'perfil.nombre_perfil', 'perfil.apellido_perfil', 'perfil.profesion')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->limit(5)
            ->get([
                'publicacion.id_publicacion',
                'publicacion.slug_publico',
                'usuario.id_usuario',
                'usuario.nombre_usuario',
                'perfil.nombre_perfil',
                'perfil.apellido_perfil',
                'perfil.profesion',
                DB::raw('COUNT(*) as total_contactos'),
            ]);

        return response()->json([
            'resumen' => [
                'usuarios_total' => (clone $usuariosBase)->count(),
                'usuarios_activos' => (clone $usuariosBase)->where('eliminado', false)->count(),
                'usuarios_inhabilitados' => (clone $usuariosBase)->where('eliminado', true)->count(),
                'admins_activos' => DB::table('usuario')->where('rol', 'admin')->where('eliminado', false)->count(),
                'perfiles_total' => DB::table('perfil')->where('eliminado', false)->count(),
                'portafolios_publicados' => DB::table('portafolio_publicacion')->where('publicado', true)->count(),
                'portafolios_con_enlace_activo' => DB::table('portafolio_publicacion')->where('enlace_activo', true)->count(),
                'visualizaciones_total' => DB::table('portafolio_visualizacion_evento')->count(),
                'contactos_total' => DB::table('portafolio_contacto_evento')->count(),
                'guardados_total' => DB::table('portafolio_guardado')->count(),
            ],
            'top_visualizaciones' => $topVisualizaciones->map(fn ($item) => $this->formatearRanking($item, 'total_visualizaciones')),
            'top_contactos' => $topContactos->map(fn ($item) => $this->formatearRanking($item, 'total_contactos')),
            'usuarios_recientes' => DB::table('usuario')
                ->orderByDesc('creado_en')
                ->limit(5)
                ->get(['id_usuario', 'correo', 'nombre_usuario', 'rol', 'eliminado', 'creado_en'])
                ->map(fn ($usuario) => [
                    'id_usuario' => $usuario->id_usuario,
                    'correo' => $usuario->correo,
                    'nombre_usuario' => $usuario->nombre_usuario,
                    'rol' => $usuario->rol,
                    'estado' => $usuario->eliminado ? 'inhabilitado' : 'activo',
                    'creado_en' => $usuario->creado_en,
                ]),
        ]);
    }

    private function esUltimoAdminActivo(Usuario $usuario): bool
    {
        return Usuario::where('rol', 'admin')
            ->where('eliminado', false)
            ->where('id_usuario', '!=', $usuario->id_usuario)
            ->doesntExist();
    }

    private function formatearRanking($item, string $metricKey): array
    {
        $nombre = trim(($item->nombre_perfil ?? '') . ' ' . ($item->apellido_perfil ?? ''));

        return [
            'id_publicacion' => $item->id_publicacion,
            'slug_publico' => $item->slug_publico,
            'usuario_id' => $item->id_usuario,
            'nombre_usuario' => $item->nombre_usuario,
            'nombre' => $nombre !== '' ? $nombre : $item->nombre_usuario,
            'profesion' => $item->profesion,
            $metricKey => (int) $item->{$metricKey},
        ];
    }

    /**
     * Helper to compute date range boundaries, label sets, and PostgreSQL date extraction groupings.
     * Centralized to allow future scalability to other types of stats reports (e.g., visualizaciones, contactos).
     */
    protected function obtenerRangoFechasYAgrupacion(string $rango): array
    {
        $now = \Illuminate\Support\Carbon::now();
        $labels = [];
        $sqlGroup = '';
        $inicio = null;
        $fin = null;
        $formateadorClave = null;

        switch ($rango) {
            case 'hoy':
                $inicio = $now->copy()->startOfDay();
                $fin = $now->copy()->endOfDay();
                $sqlGroup = "EXTRACT(HOUR FROM creado_en)";
                for ($i = 0; $i < 24; $i++) {
                    $labels[] = sprintf("%02d:00", $i);
                }
                $formateadorClave = function ($rowKey) {
                    return sprintf("%02d:00", (int)$rowKey);
                };
                break;

            case 'semana':
                $inicio = $now->copy()->startOfWeek(); // Monday
                $fin = $now->copy()->endOfWeek(); // Sunday
                $sqlGroup = "EXTRACT(ISODOW FROM creado_en)";
                $labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
                $formateadorClave = function ($rowKey) use ($labels) {
                    $idx = (int)$rowKey - 1;
                    return $labels[$idx] ?? 'Desconocido';
                };
                break;

            case 'anio':
                $inicio = $now->copy()->startOfYear();
                $fin = $now->copy()->endOfYear();
                $sqlGroup = "EXTRACT(MONTH FROM creado_en)";
                $labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                $formateadorClave = function ($rowKey) use ($labels) {
                    $idx = (int)$rowKey - 1;
                    return $labels[$idx] ?? 'Desconocido';
                };
                break;

            case 'mes':
            default:
                $inicio = $now->copy()->startOfMonth();
                $fin = $now->copy()->endOfMonth();
                $sqlGroup = "EXTRACT(DAY FROM creado_en)";
                $daysInMonth = $now->daysInMonth;
                for ($d = 1; $d <= $daysInMonth; $d++) {
                    $labels[] = sprintf("%02d", $d);
                }
                $formateadorClave = function ($rowKey) {
                    return sprintf("%02d", (int)$rowKey);
                };
                break;
        }

        return [
            'inicio' => $inicio,
            'fin' => $fin,
            'labels' => $labels,
            'sql_group' => $sqlGroup,
            'formateador_clave' => $formateadorClave,
        ];
    }

    /**
     * HU-40: User Growth statistics.
     * Returns total historical users, new users in period, and time-series growth.
     */
    public function estadisticasUsuarios(Request $request)
    {
        $rango = $request->query('rango', 'mes');
        if (!in_array($rango, ['hoy', 'semana', 'mes', 'anio'])) {
            $rango = 'mes';
        }

        $config = $this->obtenerRangoFechasYAgrupacion($rango);

        $totalUsuarios = DB::table('usuario')->count();

        $nuevosUsuarios = DB::table('usuario')
            ->where('creado_en', '>=', $config['inicio'])
            ->where('creado_en', '<=', $config['fin'])
            ->count();

        // Crecimiento agrupado
        $resultados = DB::table('usuario')
            ->select(DB::raw("{$config['sql_group']} as grupo, COUNT(*) as cantidad"))
            ->where('creado_en', '>=', $config['inicio'])
            ->where('creado_en', '<=', $config['fin'])
            ->groupBy(DB::raw($config['sql_group']))
            ->get();

        // Inicializar datos en 0
        $datosCrecimiento = array_fill_keys($config['labels'], 0);
        foreach ($resultados as $r) {
            $clave = call_user_func($config['formateador_clave'], $r->grupo);
            if (array_key_exists($clave, $datosCrecimiento)) {
                $datosCrecimiento[$clave] = (int)$r->cantidad;
            }
        }

        // Formatear para el frontend
        $crecimiento = [];
        foreach ($datosCrecimiento as $label => $valor) {
            $crecimiento[] = [
                'label' => $label,
                'valor' => $valor
            ];
        }

        return response()->json([
            'total_usuarios' => $totalUsuarios,
            'nuevos_usuarios' => $nuevosUsuarios,
            'crecimiento' => $crecimiento,
        ]);
    }

    /**
     * HU-40: Portfolio statistics.
     * Returns total active portfolios, created in period, time-series growth, and professional area distribution.
     */
    public function estadisticasPortafolios(Request $request)
    {
        $rango = $request->query('rango', 'mes');
        if (!in_array($rango, ['hoy', 'semana', 'mes', 'anio'])) {
            $rango = 'mes';
        }
        $profesion = $request->query('profesion');

        $config = $this->obtenerRangoFechasYAgrupacion($rango);

        // 1. Total histórico de portafolios activos (publicados)
        $queryTotal = DB::table('portafolio_publicacion')
            ->where('portafolio_publicacion.publicado', true);

        if ($profesion) {
            $queryTotal->join('perfil', 'perfil.usuario_id', '=', 'portafolio_publicacion.usuario_id')
                ->where('perfil.eliminado', false)
                ->whereRaw('LOWER(perfil.profesion) = ?', [mb_strtolower($profesion)]);
        }

        $totalPortafoliosActivos = $queryTotal->count();

        // 2. Portafolios creados en el periodo seleccionado
        $queryPeriodo = DB::table('portafolio_publicacion')
            ->where('portafolio_publicacion.creado_en', '>=', $config['inicio'])
            ->where('portafolio_publicacion.creado_en', '<=', $config['fin']);

        if ($profesion) {
            $queryPeriodo->join('perfil', 'perfil.usuario_id', '=', 'portafolio_publicacion.usuario_id')
                ->where('perfil.eliminado', false)
                ->whereRaw('LOWER(perfil.profesion) = ?', [mb_strtolower($profesion)]);
        }

        $creadosEnPeriodo = $queryPeriodo->count();

        // 3. Crecimiento de portafolios en el tiempo
        $queryCrecimiento = DB::table('portafolio_publicacion')
            ->select(DB::raw("{$config['sql_group']} as grupo, COUNT(*) as cantidad"))
            ->where('portafolio_publicacion.creado_en', '>=', $config['inicio'])
            ->where('portafolio_publicacion.creado_en', '<=', $config['fin']);

        if ($profesion) {
            $queryCrecimiento->join('perfil', 'perfil.usuario_id', '=', 'portafolio_publicacion.usuario_id')
                ->where('perfil.eliminado', false)
                ->whereRaw('LOWER(perfil.profesion) = ?', [mb_strtolower($profesion)]);
        }

        $resultados = $queryCrecimiento->groupBy(DB::raw($config['sql_group']))->get();

        $datosCrecimiento = array_fill_keys($config['labels'], 0);
        foreach ($resultados as $r) {
            $clave = call_user_func($config['formateador_clave'], $r->grupo);
            if (array_key_exists($clave, $datosCrecimiento)) {
                $datosCrecimiento[$clave] = (int)$r->cantidad;
            }
        }

        $crecimiento = [];
        foreach ($datosCrecimiento as $label => $valor) {
            $crecimiento[] = [
                'label' => $label,
                'valor' => $valor
            ];
        }

        // 4. Distribución por áreas profesionales (profesion) en el periodo
        $queryDist = DB::table('portafolio_publicacion')
            ->join('perfil', 'perfil.usuario_id', '=', 'portafolio_publicacion.usuario_id')
            ->where('perfil.eliminado', false)
            ->where('portafolio_publicacion.creado_en', '>=', $config['inicio'])
            ->where('portafolio_publicacion.creado_en', '<=', $config['fin'])
            ->select('perfil.profesion', DB::raw('COUNT(*) as total'))
            ->groupBy('perfil.profesion')
            ->orderByDesc('total')
            ->limit(10);

        $distribucion = $queryDist->get()->map(function ($item) {
            return [
                'profesion' => $item->profesion ?: 'Sin especificar',
                'total' => (int) $item->total,
            ];
        });

        // 5. Lista de todas las profesiones con portafolios
        $profesionesDisponibles = DB::table('perfil')
            ->where('eliminado', false)
            ->whereNotNull('profesion')
            ->where('profesion', '!=', '')
            ->distinct()
            ->orderBy('profesion')
            ->pluck('profesion');

        return response()->json([
            'total_historico_activo' => $totalPortafoliosActivos,
            'periodo_creados' => $creadosEnPeriodo,
            'crecimiento' => $crecimiento,
            'distribucion_profesiones' => $distribucion,
            'profesiones_disponibles' => $profesionesDisponibles,
        ]);
    }
}
