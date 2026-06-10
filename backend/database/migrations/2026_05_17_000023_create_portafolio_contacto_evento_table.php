<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portafolio_contacto_evento', function (Blueprint $table) {
            $table->increments('id_contacto_evento');
            $table->unsignedInteger('publicacion_id');
            $table->unsignedInteger('usuario_id_propietario');
            $table->string('slug_publico', 120);
            $table->string('medio', 40)->default('email');
            $table->string('ip_hash', 64)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->index('publicacion_id', 'idx_contacto_evento_publicacion');
            $table->index('usuario_id_propietario', 'idx_contacto_evento_propietario');
            $table->foreign('publicacion_id')->references('id_publicacion')->on('portafolio_publicacion');
            $table->foreign('usuario_id_propietario')->references('id_usuario')->on('usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portafolio_contacto_evento');
    }
};
