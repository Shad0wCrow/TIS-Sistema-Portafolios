<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VisitasFalsasSeeder extends Seeder
{
    public function run()
    {
        // 1. Buscamos todas las publicaciones que estén activas
        $publicaciones = DB::table('portafolio_publicacion')->where('publicado', true)->get();

        if ($publicaciones->isEmpty()) {
            $this->command->info('No hay portafolios publicados. Entra al sistema, publica uno y vuelve a correr este seeder.');
            return;
        }

        $vistas = [];
        $hoy = Carbon::now();

        // 2. Por cada portafolio publicado, generamos entre 20 y 100 visitas aleatorias
        foreach ($publicaciones as $pub) {
            $numVisitas = rand(20, 100);

            for ($i = 0; $i < $numVisitas; $i++) {
                // Generamos fechas aleatorias para probar tus filtros
                $probabilidad = rand(1, 100);
                
                if ($probabilidad <= 15) {
                    $fecha = $hoy->copy(); // 15% de vistas son de HOY (Filtro: Por Día)
                } elseif ($probabilidad <= 35) {
                    $fecha = $hoy->copy()->subDays(rand(1, 6)); // 20% de vistas son de esta SEMANA (Filtro: Por Semana)
                } elseif ($probabilidad <= 65) {
                    $fecha = $hoy->copy()->subDays(rand(7, 28)); // 30% de vistas son de este MES (Filtro: Por Mes)
                } else {
                    $fecha = $hoy->copy()->subMonths(rand(1, 8)); // 35% de vistas son del AÑO (Filtro: Por Año)
                }

                $ip = rand(1,255).'.'.rand(1,255).'.'.rand(1,255).'.'.rand(1,255);
                $userAgent = 'Mozilla/5.0 (Test Browser)';

                $vistas[] = [
                    'publicacion_id' => $pub->id_publicacion,
                    'usuario_id_propietario' => $pub->usuario_id,
                    'slug_publico' => $pub->slug_publico,
                    'session_key' => 'anon:' . hash('sha256', $ip . '|' . $userAgent),
                    'fecha_visita' => $fecha->toDateString(),
                    'ip_hash' => hash('sha256', $ip),
                    'user_agent' => $userAgent,
                    'creado_en' => $fecha,
                ];
            }
        }

        // 3. Insertamos todo de golpe en la base de datos
        DB::table('portafolio_visualizacion_evento')->insert($vistas);
        
        $this->command->info('¡Se insertaron ' . count($vistas) . ' visitas falsas correctamente!');
    }
}




