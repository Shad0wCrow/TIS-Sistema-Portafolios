<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto', function (Blueprint $table) {
            $table->increments('id_proyecto');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('categoria_id')->nullable();
            $table->string('titulo', 255);
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->string('repositorio_url', 500)->nullable();
            $table->string('demo_url', 500)->nullable();
            $table->string('imagen_principal_url', 500)->nullable();
            $table->boolean('eliminado')->default(false);
            $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('categoria_id')->references('id_categoria')->on('categoria_proyecto');
        });

        DB::statement("ALTER TABLE proyecto ADD COLUMN estado estado_proyecto DEFAULT 'en_progreso'");
        DB::statement("ALTER TABLE proyecto ADD COLUMN visibilidad estado_visibilidad DEFAULT 'publico'");
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto');
    }
};
