<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ranking_mensual', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedSmallInteger('anio');
            $table->unsignedTinyInteger('mes');
            $table->unsignedTinyInteger('posicion');        // 1, 2 o 3
            $table->unsignedInteger('publicacion_id');
            $table->unsignedInteger('total_visualizaciones');
            $table->timestamp('calculado_en')->useCurrent();

            // Solo puede haber una posición por mes/año
            $table->unique(['anio', 'mes', 'posicion']);

            $table->foreign('publicacion_id')
                  ->references('id_publicacion')
                  ->on('portafolio_publicacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ranking_mensual');
    }
};
