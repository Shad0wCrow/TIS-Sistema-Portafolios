<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class EstadisticasPortafolioController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $userId = $user->id_usuario;

        // Validar filtros de entrada
        $request->validate([
            'filtro' => 'nullable|in:dia,semana,mes,anio,rango',
            'fecha_inicio' => 'required_if:filtro,rango|date|nullable',
            'fecha_fin' => 'required_if:filtro,rango|date|after_or_equal:fecha_inicio|nullable',
        ]);

        $filtro = $request->query('filtro', 'mes');

        // Determinar fechas de inicio y fin según el filtro
        switch ($filtro) {
            case 'dia':
                $start = Carbon::now()->toDateString();
                $end = Carbon::now()->toDateString();
                break;
            case 'semana':
                $start = Carbon::now()->subDays(6)->toDateString();
                $end = Carbon::now()->toDateString();
                break;
            case 'anio':
                $start = Carbon::now()->subYear()->toDateString();
                $end = Carbon::now()->toDateString();
                break;
            case 'rango':
                $start = $request->query('fecha_inicio');
                $end = $request->query('fecha_fin');
                break;
            case 'mes':
            default:
                $start = Carbon::now()->subDays(29)->toDateString();
                $end = Carbon::now()->toDateString();
                break;
        }

        try {
            // 1. Vistas históricas acumuladas
            $totalVistasHistorico = DB::table('portafolio_visualizacion_evento')
                ->where('usuario_id_propietario', $userId)
                ->count();

            // 2. Guardados históricos acumulados (cuántas personas guardaron su portafolio)
            $pub = DB::table('portafolio_publicacion')
                ->where('usuario_id', $userId)
                ->first();

            $totalGuardadosHistorico = 0;
            if ($pub) {
                $totalGuardadosHistorico = DB::table('portafolio_guardado')
                    ->where('publicacion_id', $pub->id_publicacion)
                    ->count();
            }

            // 3. Vistas en el período seleccionado
            $vistasPeriodo = DB::table('portafolio_visualizacion_evento')
                ->where('usuario_id_propietario', $userId)
                ->whereBetween('fecha_visita', [$start, $end])
                ->count();

            // 4. Guardados en el período seleccionado
            $guardadosPeriodo = 0;
            if ($pub) {
                $guardadosPeriodo = DB::table('portafolio_guardado')
                    ->where('publicacion_id', $pub->id_publicacion)
                    ->whereBetween('creado_en', ["$start 00:00:00", "$end 23:59:59"])
                    ->count();
            }

            // 5. Evolución de vistas en el tiempo (llenando los días sin visitas con 0)
            $startDate = Carbon::parse($start);
            $endDate = Carbon::parse($end);
            
            // Límite de días para evitar colapsar la respuesta en filtros extremadamente grandes
            $diffDays = $startDate->diffInDays($endDate);
            if ($diffDays > 366) {
                return response()->json([
                    'message' => 'El rango de fechas seleccionado no puede ser mayor a un año.'
                ], 422);
            }

            $dbCounts = DB::table('portafolio_visualizacion_evento')
                ->select('fecha_visita', DB::raw('count(*) as total'))
                ->where('usuario_id_propietario', $userId)
                ->whereBetween('fecha_visita', [$start, $end])
                ->groupBy('fecha_visita')
                ->pluck('total', 'fecha_visita')
                ->toArray();

            $evolucion = [];
            // Si el período es 'anio', podemos agrupar por mes para que se vea más ordenado, 
            // pero para cumplir con todos los filtros de manera homogénea agrupamos por día.
            for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                $dStr = $date->toDateString();
                $evolucion[] = [
                    'fecha' => $dStr,
                    'cantidad' => isset($dbCounts[$dStr]) ? (int) $dbCounts[$dStr] : 0
                ];
            }

            // 6. Cantidad de registros en cada sección del portafolio
            $proyectosCount = DB::table('proyecto')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->count();

            $educacionCount = DB::table('educacion')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->where('area_estudio', '!=', 'curso')
                ->count();

            $cursosCount = DB::table('educacion')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->where('area_estudio', '=', 'curso')
                ->count();

            $experienciaCount = DB::table('experiencia')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->count();

            $certificacionesCount = DB::table('certificacion')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->count();

            $logrosCount = DB::table('logro')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->count();

            $habilidadesCount = DB::table('usuario_habilidad')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->count();

            $idiomasCount = DB::table('usuario_idioma')
                ->where('usuario_id', $userId)
                ->where('eliminado', false)
                ->count();

            return response()->json([
                'total_vistas_historico' => (int) $totalVistasHistorico,
                'total_guardados_historico' => (int) $totalGuardadosHistorico,
                'vistas_periodo' => (int) $vistasPeriodo,
                'guardados_periodo' => (int) $guardadosPeriodo,
                'evolucion_vistas' => $evolucion,
                'secciones' => [
                    'proyectos' => (int) $proyectosCount,
                    'educacion' => (int) $educacionCount,
                    'cursos' => (int) $cursosCount,
                    'experiencia' => (int) $experienciaCount,
                    'certificaciones' => (int) $certificacionesCount,
                    'logros' => (int) $logrosCount,
                    'habilidades' => (int) $habilidadesCount,
                    'idiomas' => (int) $idiomasCount,
                ],
                'periodo' => [
                    'filtro' => $filtro,
                    'fecha_inicio' => $start,
                    'fecha_fin' => $end,
                ]
            ]);

        } catch (\Throwable $exception) {
            Log::error('Error al obtener estadísticas del portafolio', [
                'usuario_id' => $userId,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'No se pudieron cargar las estadísticas. Intenta nuevamente.',
            ], 500);
        }
    }
}
