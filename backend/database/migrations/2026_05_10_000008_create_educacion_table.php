<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educacion', function (Blueprint $table) {
            $table->increments('id_educacion');
            $table->unsignedInteger('usuario_id');
            $table->string('institucion', 150)->nullable();
            $table->string('titulo', 150)->nullable();
            $table->string('area_estudio', 150)->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->text('descripcion')->nullable();
            $table->boolean('eliminado')->default(false);

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
        });

        DB::statement("ALTER TABLE educacion ADD COLUMN visibilidad estado_visibilidad DEFAULT 'privado'");
    }

    public function down(): void
    {
        Schema::dropIfExists('educacion');
    }
};
