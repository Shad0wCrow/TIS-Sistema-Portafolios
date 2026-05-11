<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entidad_emisora', function (Blueprint $table) {
            $table->increments('id_entidad_emisora');
            $table->string('nombre', 150);
            $table->string('sitio_web', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entidad_emisora');
    }
};
