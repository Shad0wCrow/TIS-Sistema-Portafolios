<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion_privacidad', function (Blueprint $table) {
            $table->increments('id_configuracion');
            $table->unsignedInteger('usuario_id')->unique();
            $table->boolean('mostrar_correo')->default(false);
            $table->boolean('mostrar_ubicacion')->default(false);
            // seccion_* campos — varchar para compatibilidad
            $table->string('seccion_perfil', 10)->default('publico');
            $table->string('seccion_habilidades', 10)->default('publico');
            $table->string('seccion_proyectos', 10)->default('publico');
            $table->string('seccion_educacion', 10)->default('publico');
            $table->string('seccion_experiencia', 10)->default('publico');
            $table->string('seccion_cursos', 10)->default('publico');
            $table->string('seccion_certificaciones', 10)->default('publico');
            $table->string('seccion_logros', 10)->default('publico');
            $table->string('seccion_idiomas', 10)->default('publico');
            // Eloquent timestamps
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
        });

        // Columnas con tipo ENUM nativo de PostgreSQL
        DB::statement("ALTER TABLE configuracion_privacidad ADD COLUMN visibilidad_proyectos_por_defecto estado_visibilidad DEFAULT 'privado'");
        DB::statement("ALTER TABLE configuracion_privacidad ADD COLUMN visibilidad_habilidades_por_defecto estado_visibilidad DEFAULT 'privado'");
        DB::statement("ALTER TABLE configuracion_privacidad ADD COLUMN visibilidad_experiencias_por_defecto estado_visibilidad DEFAULT 'privado'");
        DB::statement("ALTER TABLE configuracion_privacidad ADD COLUMN visibilidad_logros_por_defecto estado_visibilidad DEFAULT 'privado'");
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion_privacidad');
    }
};
