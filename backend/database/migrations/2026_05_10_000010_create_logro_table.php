<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logro', function (Blueprint $table) {
            $table->increments('id_logro');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('entidad_emisora_id')->nullable();
            $table->string('titulo', 150);
            $table->text('descripcion')->nullable();
            $table->date('fecha_obtencion')->nullable();
            $table->string('url_credencial', 500)->nullable();
            $table->string('identificador', 150)->nullable();
            $table->boolean('eliminado')->default(false);

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('entidad_emisora_id')->references('id_entidad_emisora')->on('entidad_emisora');
        });

        DB::statement("ALTER TABLE logro ADD COLUMN visibilidad estado_visibilidad DEFAULT 'publico'");
    }

    public function down(): void
    {
        Schema::dropIfExists('logro');
    }
};
