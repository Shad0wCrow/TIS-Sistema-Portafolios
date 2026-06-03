<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CerrarRankingMensual extends Command
{
    protected $signature   = 'ranking:cerrar-mes';
    protected $description = 'Calcula y persiste el Top 3 del mes que acaba de cerrar';

    public function handle(): void
    {
        // Trabaja sobre el mes anterior (ya cerrado)
        $periodo   = now()->subMonth();
        $anio      = $periodo->year;
        $mes       = $periodo->month;
        $inicioMes = $periodo->copy()->startOfMonth()->toDateString();
        $finMes    = $periodo->copy()->endOfMonth()->toDateString();

        $top3 = DB::table('portafolio_visualizacion_evento as v')
            ->join('portafolio_publicacion as pub', 'pub.id_publicacion', '=', 'v.publicacion_id')
            ->join('usuario', 'usuario.id_usuario', '=', 'pub.usuario_id')
            ->where('pub.publicado', true)
            ->where('usuario.eliminado', false)
            ->whereBetween('v.fecha_visita', [$inicioMes, $finMes])
            ->groupBy('pub.id_publicacion')
            ->orderByDesc('total_visualizaciones')
            ->limit(3)
            ->get([
                'pub.id_publicacion',
                DB::raw('COUNT(v.id_visualizacion_evento) as total_visualizaciones'),
            ]);

        // Borra el ranking anterior de ese mes por si se re-ejecuta el comando
        DB::table('ranking_mensual')
            ->where('anio', $anio)
            ->where('mes', $mes)
            ->delete();

        $top3->each(function ($item, $indice) use ($anio, $mes) {
            DB::table('ranking_mensual')->insert([
                'anio'                  => $anio,
                'mes'                   => $mes,
                'posicion'              => $indice + 1,
                'publicacion_id'        => $item->id_publicacion,
                'total_visualizaciones' => $item->total_visualizaciones,
                'calculado_en'          => now(),
            ]);
        });

        // Limpia el cache para que el próximo request lea los datos recién guardados
        Cache::forget('ranking_top3_' . $periodo->format('Y_m'));

        $this->info("Ranking {$anio}-{$mes} guardado con {$top3->count()} entradas.");
    }
}
