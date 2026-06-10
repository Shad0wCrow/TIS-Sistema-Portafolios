<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perfil_enlace', function (Blueprint $table) {
            $table->increments('id_perfil_enlace');
            $table->unsignedInteger('perfil_id');
            $table->string('titulo', 80);
            $table->string('url', 500);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->boolean('eliminado')->default(false);
            $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));

            $table->index('perfil_id', 'idx_perfil_enlace_perfil');
            $table->foreign('perfil_id')->references('id_perfil')->on('perfil');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perfil_enlace');
    }
};
