<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portafolio_publicacion', function (Blueprint $table) {
            $table->increments('id_publicacion');
            $table->integer('usuario_id');
            $table->string('slug_publico', 120)->unique();
            $table->boolean('publicado')->default(false);
            $table->timestamp('publicado_en')->nullable();
            $table->timestamp('despublicado_en')->nullable();
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();

            $table->unique('usuario_id');
            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portafolio_publicacion');
    }
};
