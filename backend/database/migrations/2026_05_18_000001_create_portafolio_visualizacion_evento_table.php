<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portafolio_visualizacion_evento', function (Blueprint $table) {
            $table->increments('id_visualizacion_evento');
            $table->unsignedInteger('publicacion_id');
            $table->unsignedInteger('usuario_id_propietario');
            $table->unsignedInteger('usuario_id_visitante')->nullable();
            $table->string('slug_publico', 120);
            $table->string('session_key', 120);
            $table->date('fecha_visita');
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->unique(['publicacion_id', 'session_key', 'fecha_visita'], 'uq_visualizacion_publicacion_sesion_fecha');
            $table->index('publicacion_id', 'idx_visualizacion_publicacion');
            $table->index('usuario_id_propietario', 'idx_visualizacion_propietario');
            $table->foreign('publicacion_id')->references('id_publicacion')->on('portafolio_publicacion');
            $table->foreign('usuario_id_propietario')->references('id_usuario')->on('usuario');
            $table->foreign('usuario_id_visitante')->references('id_usuario')->on('usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portafolio_visualizacion_evento');
    }
};
