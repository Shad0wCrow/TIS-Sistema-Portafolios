<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portafolio_guardado', function (Blueprint $table) {
            $table->increments('id_guardado');
            $table->integer('usuario_id');
            $table->integer('publicacion_id');
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();

            $table->unique(['usuario_id', 'publicacion_id'], 'uq_portafolio_guardado_usuario_publicacion');
            $table->index('usuario_id', 'idx_portafolio_guardado_usuario');
            $table->index('publicacion_id', 'idx_portafolio_guardado_publicacion');
            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('publicacion_id')->references('id_publicacion')->on('portafolio_publicacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portafolio_guardado');
    }
};
