<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Publica los portafolios de los 6 usuarios.
 *
 * Escenarios cubiertos para poder probar la lógica del sistema:
 *
 *  usuario 1 → Ana Torres      → publicado   (slug limpio, secciones todas públicas)
 *  usuario 2 → Carlos Mendoza  → publicado   (slug limpio, experiencia privada)
 *  usuario 3 → Lucía Vargas    → publicado   (slug limpio, todas públicas)
 *  usuario 4 → Diego Quispe    → publicado   (slug con guiones, logros privados)
 *  usuario 5 → Sofía Romero    → publicado   (slug estándar, todas públicas)
 *  usuario 6 → Mateo Fernández → despublicado temporalmente (para testear ese estado)
 *
 * Dependencia: UsuarioPerfilSeeder debe haberse ejecutado antes.
 */
class PortafolioPublicacionSeeder extends Seeder
{
    public function run(): void
    {
        // ─── 1. portafolio_publicacion ────────────────────────────────
        DB::table('portafolio_publicacion')->insert([
            [
                'usuario_id'      => 1,
                'slug_publico'    => 'ana-torres',
                'publicado'       => true,
                'publicado_en'    => now()->subMonths(5),
                'despublicado_en' => null,
                'creado_en'       => now()->subMonths(5),
                'actualizado_en'  => now()->subDays(1),
            ],
            [
                'usuario_id'      => 2,
                'slug_publico'    => 'carlos-mendoza',
                'publicado'       => true,
                'publicado_en'    => now()->subMonths(4),
                'despublicado_en' => null,
                'creado_en'       => now()->subMonths(4),
                'actualizado_en'  => now()->subDays(5),
            ],
            [
                'usuario_id'      => 3,
                'slug_publico'    => 'lucia-vargas',
                'publicado'       => true,
                'publicado_en'    => now()->subMonths(3),
                'despublicado_en' => null,
                'creado_en'       => now()->subMonths(3),
                'actualizado_en'  => now()->subDays(1),
            ],
            [
                'usuario_id'      => 4,
                'slug_publico'    => 'diego-quispe-data',
                'publicado'       => true,
                'publicado_en'    => now()->subMonths(2),
                'despublicado_en' => null,
                'creado_en'       => now()->subMonths(2),
                'actualizado_en'  => now()->subWeek(),
            ],
            [
                'usuario_id'      => 5,
                'slug_publico'    => 'sofia-romero',
                'publicado'       => true,
                'publicado_en'    => now()->subMonth(),
                'despublicado_en' => null,
                'creado_en'       => now()->subMonth(),
                'actualizado_en'  => now()->subDays(3),
            ],
            [
                // Mateo despublicó temporalmente para hacer cambios en su perfil.
                // Sirve para testear el estado publicado=false.
                'usuario_id'      => 6,
                'slug_publico'    => 'mateo-fernandez-devops',
                'publicado'       => false,
                'publicado_en'    => now()->subMonths(3),
                'despublicado_en' => now()->subDays(2),
                'creado_en'       => now()->subMonths(3),
                'actualizado_en'  => now()->subDays(2),
            ],
        ]);

        // ─── 2. Ajustar configuracion_privacidad con secciones ────────
        //
        // Las columnas seccion_* fueron añadidas por las migraciones
        // 2026_05_03_000002 y 2026_05_04_000003, por lo que ya existen
        // en la tabla. Aquí personalizamos cada usuario para tener
        // escenarios de prueba variados.

        // Ana (1) → Todo público
        DB::table('configuracion_privacidad')
            ->where('usuario_id', 1)
            ->update([
                'seccion_perfil'          => 'publico',
                'seccion_proyectos'       => 'publico',
                'seccion_habilidades'     => 'publico',
                'seccion_experiencia'     => 'publico',
                'seccion_educacion'       => 'publico',
                'seccion_cursos'          => 'publico',
                'seccion_certificaciones' => 'publico',
                'seccion_logros'          => 'publico',
                'seccion_idiomas'         => 'publico',
            ]);

        // Carlos (2) → Experiencia y educación privadas (solo muestra proyectos y skills)
        DB::table('configuracion_privacidad')
            ->where('usuario_id', 2)
            ->update([
                'seccion_perfil'          => 'publico',
                'seccion_proyectos'       => 'publico',
                'seccion_habilidades'     => 'publico',
                'seccion_experiencia'     => 'privado',
                'seccion_educacion'       => 'privado',
                'seccion_cursos'          => 'publico',
                'seccion_certificaciones' => 'publico',
                'seccion_logros'          => 'publico',
                'seccion_idiomas'         => 'publico',
            ]);

        // Lucía (3) → Todo público
        DB::table('configuracion_privacidad')
            ->where('usuario_id', 3)
            ->update([
                'seccion_perfil'          => 'publico',
                'seccion_proyectos'       => 'publico',
                'seccion_habilidades'     => 'publico',
                'seccion_experiencia'     => 'publico',
                'seccion_educacion'       => 'publico',
                'seccion_cursos'          => 'publico',
                'seccion_certificaciones' => 'publico',
                'seccion_logros'          => 'publico',
                'seccion_idiomas'         => 'publico',
            ]);

        // Diego (4) → Logros y cursos privados (data engineer conservador)
        DB::table('configuracion_privacidad')
            ->where('usuario_id', 4)
            ->update([
                'seccion_perfil'          => 'publico',
                'seccion_proyectos'       => 'publico',
                'seccion_habilidades'     => 'publico',
                'seccion_experiencia'     => 'publico',
                'seccion_educacion'       => 'publico',
                'seccion_cursos'          => 'privado',
                'seccion_certificaciones' => 'publico',
                'seccion_logros'          => 'privado',
                'seccion_idiomas'         => 'publico',
            ]);

        // Sofía (5) → Todo público
        DB::table('configuracion_privacidad')
            ->where('usuario_id', 5)
            ->update([
                'seccion_perfil'          => 'publico',
                'seccion_proyectos'       => 'publico',
                'seccion_habilidades'     => 'publico',
                'seccion_experiencia'     => 'publico',
                'seccion_educacion'       => 'publico',
                'seccion_cursos'          => 'publico',
                'seccion_certificaciones' => 'publico',
                'seccion_logros'          => 'publico',
                'seccion_idiomas'         => 'publico',
            ]);

        // Mateo (6) → Despublicado, pero configuración de secciones lista para cuando vuelva a publicar
        DB::table('configuracion_privacidad')
            ->where('usuario_id', 6)
            ->update([
                'seccion_perfil'          => 'publico',
                'seccion_proyectos'       => 'publico',
                'seccion_habilidades'     => 'publico',
                'seccion_experiencia'     => 'publico',
                'seccion_educacion'       => 'publico',
                'seccion_cursos'          => 'publico',
                'seccion_certificaciones' => 'publico',
                'seccion_logros'          => 'publico',
                'seccion_idiomas'         => 'publico',
            ]);
    }
}