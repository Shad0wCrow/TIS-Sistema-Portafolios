<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_usuario', function (Blueprint $table) {
            $table->increments('id_proyecto_usuario');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('proyecto_id');
            $table->string('rol_proyecto', 50)->nullable();
            $table->boolean('es_propietario')->default(false);

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('proyecto_id')->references('id_proyecto')->on('proyecto');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_usuario');
    }
};
