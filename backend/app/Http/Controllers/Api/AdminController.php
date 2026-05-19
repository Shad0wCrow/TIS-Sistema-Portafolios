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
}
