<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('configuracion_privacidad', function (Blueprint $table) {
            // Timestamps requeridos por Eloquent para created_at / updated_at.
            // Se agregan como nullable para no romper filas existentes.
            if (!Schema::hasColumn('configuracion_privacidad', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }

            // Toggle de visibilidad por sección completa.
            // Se agregan solo si todavía no existen.
            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_proyectos')) {
                $table->string('seccion_proyectos', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_habilidades')) {
                $table->string('seccion_habilidades', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_experiencia')) {
                $table->string('seccion_experiencia', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_logros')) {
                $table->string('seccion_logros', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_perfil')) {
                $table->string('seccion_perfil', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_educacion')) {
                $table->string('seccion_educacion', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_cursos')) {
                $table->string('seccion_cursos', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_certificaciones')) {
                $table->string('seccion_certificaciones', 255)->default('publico');
            }

            if (!Schema::hasColumn('configuracion_privacidad', 'seccion_idiomas')) {
                $table->string('seccion_idiomas', 255)->default('publico');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuracion_privacidad', function (Blueprint $table) {
            if (Schema::hasColumn('configuracion_privacidad', 'seccion_proyectos')) {
                $table->dropColumn('seccion_proyectos');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_habilidades')) {
                $table->dropColumn('seccion_habilidades');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_experiencia')) {
                $table->dropColumn('seccion_experiencia');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_logros')) {
                $table->dropColumn('seccion_logros');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_perfil')) {
                $table->dropColumn('seccion_perfil');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_educacion')) {
                $table->dropColumn('seccion_educacion');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_cursos')) {
                $table->dropColumn('seccion_cursos');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_certificaciones')) {
                $table->dropColumn('seccion_certificaciones');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'seccion_idiomas')) {
                $table->dropColumn('seccion_idiomas');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'updated_at')) {
                $table->dropColumn('updated_at');
            }

            if (Schema::hasColumn('configuracion_privacidad', 'created_at')) {
                $table->dropColumn('created_at');
            }
        });
    }
};
