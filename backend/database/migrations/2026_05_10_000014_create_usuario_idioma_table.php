<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_idioma', function (Blueprint $table) {
            $table->increments('id_usuario_idioma');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('idioma_id');
            $table->boolean('eliminado')->default(false);

            $table->unique(['usuario_id', 'idioma_id'], 'uq_usuario_idioma');
            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('idioma_id')->references('id_idioma')->on('idioma');
        });

        DB::statement("ALTER TABLE usuario_idioma ADD COLUMN nivel nivel_idioma NOT NULL DEFAULT 'a1'");
        DB::statement("ALTER TABLE usuario_idioma ADD COLUMN visibilidad estado_visibilidad DEFAULT 'publico'");
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_idioma');
    }
};
