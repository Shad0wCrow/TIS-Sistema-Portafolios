<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perfil', function (Blueprint $table) {
            $table->increments('id_perfil');
            $table->unsignedInteger('usuario_id')->unique();
            $table->string('nombre_perfil', 255)->nullable();
            $table->string('apellido_perfil', 255)->nullable();
            $table->string('profesion', 150)->nullable();
            $table->string('celular', 20)->nullable();
            $table->text('descripcion')->nullable();
            $table->string('foto_url', 500)->nullable();
            $table->string('correo_contacto', 255)->nullable();
            $table->string('linkedin_url', 255)->nullable();
            $table->boolean('eliminado')->default(false);

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
        });

        // Columna con tipo ENUM nativo de PostgreSQL
        DB::statement("ALTER TABLE perfil ADD COLUMN visibilidad estado_visibilidad DEFAULT 'privado'");
    }

    public function down(): void
    {
        Schema::dropIfExists('perfil');
    }
};
