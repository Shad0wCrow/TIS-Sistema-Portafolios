<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminVisualizacionesController extends Controller
{
    public function masVisitados(Request $request)
    {
        $periodo = $request->query('periodo', 'historico'); // historico, anio, mes, semana, dia
        $fechaEspecifica = $request->query('fecha', null); // YYYY-MM-DD
        
        // HU-3, 4, 6, 8, 10: Límite de 15 primeros
        $limit = $request->query('limit', 15); 

        $query = DB::table('portafolio_publicacion as pp')
            ->join('portafolio_visualizacion_evento as pve', 'pp.id_publicacion', '=', 'pve.publicacion_id')
            ->join('usuario as u', 'pp.usuario_id', '=', 'u.id_usuario')
            ->where('pp.publicado', true)
            ->select(
                'pp.id_publicacion', 
                'pp.slug_publico', 
                'u.nombre_usuario', 
                'u.correo',
                DB::raw('COUNT(*) as total_vistas')
            );

        // HU-2, 3, 5, 7, 9, 12: Lógica de filtrado por periodo y fecha específica
        if ($periodo !== 'historico') {
            $fecha = $fechaEspecifica ? Carbon::parse($fechaEspecifica) : Carbon::now();

            switch ($periodo) {
                case 'anio':
                    $query->whereYear('pve.creado_en', $fecha->year);
                    break;
                case 'mes':
                    $query->whereYear('pve.creado_en', $fecha->year)
                          ->whereMonth('pve.creado_en', $fecha->month);
                    break;
                case 'semana':
                    $query->whereBetween('pve.creado_en', [
                        $fecha->copy()->startOfWeek(),
                        $fecha->copy()->endOfWeek()
                    ]);
                    break;
                case 'dia':
                    $query->whereDate('pve.creado_en', $fecha->toDateString());
                    break;
            }
        }

        $resultados = $query->groupBy('pp.id_publicacion', 'pp.slug_publico', 'u.nombre_usuario', 'u.correo')
                            ->orderByDesc(DB::raw('COUNT(*)'))
                            ->limit($limit)
                            ->get();

        return response()->json([
            // HU-11: El portafolio con más vistas absoluto del filtro
            'top_1' => $resultados->first(),
            'ranking' => $resultados,
            // HU-13: Mensaje cuando no hay datos
            'mensaje' => $resultados->isEmpty() ? 'No hay portafolios publicados aún' : null
        ]);
    }
}
