<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Habilidades por usuario.
 *
 * habilidad_id según CatalogoSeeder (orden de inserción):
 *   1=PHP         2=Laravel      3=JavaScript   4=TypeScript   5=React
 *   6=Vue.js      7=Node.js      8=Python       9=Django      10=PostgreSQL
 *  11=MySQL      12=MongoDB     13=Docker      14=Git         15=REST APIs
 *  16=GraphQL    17=AWS         18=Linux       19=UI/UX       20=Figma
 *  21=Liderazgo  22=Comunicación 23=Trabajo en equipo  24=Resolución de problemas
 *  25=Gestión del tiempo  26=Adaptabilidad  27=Creatividad
 */
class HabilidadesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('usuario_habilidad')->insert([
            // ── Ana Torres (1) – Fullstack / Tech Lead ──────────────
            ['usuario_id' => 1, 'habilidad_id' => 1,  'nivel' => 'experto',    'anos_experiencia' => 6, 'categoria' => 'Backend',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 2,  'nivel' => 'experto',    'anos_experiencia' => 5, 'categoria' => 'Backend',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 3,  'nivel' => 'avanzado',   'anos_experiencia' => 5, 'categoria' => 'Frontend',  'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 5,  'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Frontend',  'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 10, 'nivel' => 'avanzado',   'anos_experiencia' => 5, 'categoria' => 'Bases de Datos','destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 14, 'nivel' => 'experto',    'anos_experiencia' => 6, 'categoria' => 'Herramientas','destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 15, 'nivel' => 'experto',    'anos_experiencia' => 5, 'categoria' => 'Backend',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 21, 'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Blandas',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'habilidad_id' => 22, 'nivel' => 'avanzado',   'anos_experiencia' => 6, 'categoria' => 'Blandas',   'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],

            // ── Carlos Mendoza (2) – Backend Developer ───────────────
            ['usuario_id' => 2, 'habilidad_id' => 7,  'nivel' => 'experto',    'anos_experiencia' => 4, 'categoria' => 'Backend',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 3,  'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Backend',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 4,  'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Backend',   'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 10, 'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Bases de Datos','destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 12, 'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Bases de Datos','destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 15, 'nivel' => 'experto',    'anos_experiencia' => 4, 'categoria' => 'Backend',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 16, 'nivel' => 'intermedio', 'anos_experiencia' => 2, 'categoria' => 'Backend',   'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 13, 'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'DevOps',    'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'habilidad_id' => 24, 'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Blandas',   'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],

            // ── Lucía Vargas (3) – Frontend / UI Designer ────────────
            ['usuario_id' => 3, 'habilidad_id' => 6,  'nivel' => 'experto',    'anos_experiencia' => 4, 'categoria' => 'Frontend',  'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'habilidad_id' => 3,  'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Frontend',  'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'habilidad_id' => 4,  'nivel' => 'intermedio', 'anos_experiencia' => 2, 'categoria' => 'Frontend',  'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'habilidad_id' => 19, 'nivel' => 'experto',    'anos_experiencia' => 4, 'categoria' => 'Diseño',    'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'habilidad_id' => 20, 'nivel' => 'experto',    'anos_experiencia' => 4, 'categoria' => 'Diseño',    'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'habilidad_id' => 14, 'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Herramientas','destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'habilidad_id' => 27, 'nivel' => 'experto',    'anos_experiencia' => 5, 'categoria' => 'Blandas',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'habilidad_id' => 22, 'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Blandas',   'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],

            // ── Diego Quispe (4) – Data Engineer ─────────────────────
            ['usuario_id' => 4, 'habilidad_id' => 8,  'nivel' => 'experto',    'anos_experiencia' => 5, 'categoria' => 'Lenguajes', 'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'habilidad_id' => 10, 'nivel' => 'experto',    'anos_experiencia' => 5, 'categoria' => 'Bases de Datos','destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'habilidad_id' => 17, 'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Cloud',     'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'habilidad_id' => 12, 'nivel' => 'intermedio', 'anos_experiencia' => 2, 'categoria' => 'Bases de Datos','destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'habilidad_id' => 13, 'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'DevOps',    'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'habilidad_id' => 24, 'nivel' => 'experto',    'anos_experiencia' => 5, 'categoria' => 'Blandas',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],

            // ── Sofía Romero (5) – Mobile Developer ──────────────────
            ['usuario_id' => 5, 'habilidad_id' => 3,  'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Mobile',    'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'habilidad_id' => 4,  'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Mobile',    'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'habilidad_id' => 5,  'nivel' => 'intermedio', 'anos_experiencia' => 2, 'categoria' => 'Frontend',  'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'habilidad_id' => 14, 'nivel' => 'avanzado',   'anos_experiencia' => 3, 'categoria' => 'Herramientas','destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'habilidad_id' => 19, 'nivel' => 'intermedio', 'anos_experiencia' => 2, 'categoria' => 'Diseño',    'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'habilidad_id' => 23, 'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Blandas',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'habilidad_id' => 26, 'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Blandas',   'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],

            // ── Mateo Fernández (6) – DevOps / Cloud ─────────────────
            ['usuario_id' => 6, 'habilidad_id' => 13, 'nivel' => 'experto',    'anos_experiencia' => 6, 'categoria' => 'DevOps',    'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'habilidad_id' => 17, 'nivel' => 'experto',    'anos_experiencia' => 5, 'categoria' => 'Cloud',     'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'habilidad_id' => 18, 'nivel' => 'experto',    'anos_experiencia' => 7, 'categoria' => 'Sistemas',  'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'habilidad_id' => 8,  'nivel' => 'avanzado',   'anos_experiencia' => 4, 'categoria' => 'Lenguajes', 'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'habilidad_id' => 14, 'nivel' => 'experto',    'anos_experiencia' => 7, 'categoria' => 'Herramientas','destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'habilidad_id' => 25, 'nivel' => 'experto',    'anos_experiencia' => 6, 'categoria' => 'Blandas',   'destacado' => 'no', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'habilidad_id' => 22, 'nivel' => 'avanzado',   'anos_experiencia' => 5, 'categoria' => 'Blandas',   'destacado' => 'sí', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
        ]);
    }
}
