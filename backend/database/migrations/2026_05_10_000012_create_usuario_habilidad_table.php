<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_habilidad', function (Blueprint $table) {
            $table->increments('id_usuario_habilidad');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('habilidad_id');
            $table->integer('anos_experiencia')->nullable();
            $table->string('categoria', 50)->nullable();
            $table->string('destacado', 100)->nullable();
            $table->boolean('eliminado')->default(false);
            $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('actualizado_en')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->unique(['usuario_id', 'habilidad_id'], 'uq_usuario_habilidad');
            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('habilidad_id')->references('id_habilidad')->on('habilidad');
        });

        DB::statement("ALTER TABLE usuario_habilidad ADD COLUMN nivel nivel_habilidad");
        DB::statement("ALTER TABLE usuario_habilidad ADD COLUMN visibilidad estado_visibilidad DEFAULT 'privado'");
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_habilidad');
    }
};
