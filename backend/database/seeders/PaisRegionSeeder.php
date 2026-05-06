<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaisRegionSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Países ───────────────────────────────────────────────────
        $paises = [
            ['nombre' => 'Bolivia',          'iso' => 'BO'],
            ['nombre' => 'Argentina',         'iso' => 'AR'],
            ['nombre' => 'Colombia',          'iso' => 'CO'],
            ['nombre' => 'México',            'iso' => 'MX'],
            ['nombre' => 'España',            'iso' => 'ES'],
            ['nombre' => 'Estados Unidos',    'iso' => 'US'],
            ['nombre' => 'Chile',             'iso' => 'CL'],
            ['nombre' => 'Perú',              'iso' => 'PE'],
        ];

        DB::table('pais')->insert($paises);

        // ─── Regiones ─────────────────────────────────────────────────
        // Bolivia (id 1)
        $regionesBolivia = [
            'La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro',
            'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando',
        ];

        // Argentina (id 2)
        $regionesArgentina = [
            'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Tucumán',
        ];

        // Colombia (id 3)
        $regionesColombia = [
            'Bogotá', 'Medellín', 'Cali', 'Barranquilla',
        ];

        // México (id 4)
        $regionesMexico = [
            'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla',
        ];

        // España (id 5)
        $regionesEspania = [
            'Madrid', 'Barcelona', 'Valencia', 'Sevilla',
        ];

        // Estados Unidos (id 6)
        $regionesEEUU = [
            'California', 'Texas', 'New York', 'Florida',
        ];

        // Chile (id 7)
        $regionesChile = [
            'Santiago', 'Valparaíso', 'Antofagasta',
        ];

        // Perú (id 8)
        $regionesPeru = [
            'Lima', 'Arequipa', 'Trujillo',
        ];

        $allRegiones = [
            1 => $regionesBolivia,
            2 => $regionesArgentina,
            3 => $regionesColombia,
            4 => $regionesMexico,
            5 => $regionesEspania,
            6 => $regionesEEUU,
            7 => $regionesChile,
            8 => $regionesPeru,
        ];

        $rows = [];
        foreach ($allRegiones as $paisId => $regiones) {
            foreach ($regiones as $nombre) {
                $rows[] = ['pais_id' => $paisId, 'nombre' => $nombre];
            }
        }

        DB::table('region')->insert($rows);
    }
}
