<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * HU-23: Agrega columnas de visibilidad de SECCIÓN COMPLETA a
 * configuracion_privacidad, usando el mismo tipo estado_visibilidad
 * ('publico' | 'privado') que el resto del sistema.
 *
 * Distinción semántica:
 *  - visibilidad_*_por_defecto  → visibilidad por defecto de cada ÍTEM individual.
 *  - seccion_*                  → si la SECCIÓN COMPLETA aparece en el portafolio.
 *                                 Si es 'privado', ningún ítem de esa sección se muestra,
 *                                 sin importar la visibilidad individual de cada ítem.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion_privacidad', function (Blueprint $table) {
            // Secciones que ya tenían campo "_por_defecto" → se añade su toggle de sección
            $table->string('seccion_proyectos')       ->default('publico')->after('visibilidad_logros_por_defecto');
            $table->string('seccion_habilidades')     ->default('publico')->after('seccion_proyectos');
            $table->string('seccion_experiencia')     ->default('publico')->after('seccion_habilidades');
            $table->string('seccion_logros')          ->default('publico')->after('seccion_experiencia');

            // Secciones nuevas
            $table->string('seccion_perfil')          ->default('publico')->after('seccion_logros');
            $table->string('seccion_educacion')       ->default('publico')->after('seccion_perfil');
            $table->string('seccion_cursos')          ->default('publico')->after('seccion_educacion');
            $table->string('seccion_certificaciones') ->default('publico')->after('seccion_cursos');
            $table->string('seccion_idiomas')         ->default('publico')->after('seccion_certificaciones');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion_privacidad', function (Blueprint $table) {
            $table->dropColumn([
                'seccion_proyectos',
                'seccion_habilidades',
                'seccion_experiencia',
                'seccion_logros',
                'seccion_perfil',
                'seccion_educacion',
                'seccion_cursos',
                'seccion_certificaciones',
                'seccion_idiomas',
            ]);
        });
    }
};
