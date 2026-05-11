<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiencia', function (Blueprint $table) {
            $table->increments('id_experiencia');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('empresa_id')->nullable();
            $table->string('tipo', 50)->nullable();
            $table->string('puesto', 150)->nullable();
            $table->text('descripcion')->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->boolean('es_actual')->default(false);
            $table->string('ubicacion', 150)->nullable();
            $table->boolean('eliminado')->default(false);

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('empresa_id')->references('id_empresa')->on('empresa');
        });

        DB::statement("ALTER TABLE experiencia ADD COLUMN visibilidad estado_visibilidad DEFAULT 'privado'");
    }

    public function down(): void
    {
        Schema::dropIfExists('experiencia');
    }
};
