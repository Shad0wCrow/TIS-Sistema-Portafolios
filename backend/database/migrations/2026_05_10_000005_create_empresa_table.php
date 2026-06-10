<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresa', function (Blueprint $table) {
            $table->increments('id_empresa');
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->string('sitio_web', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresa');
    }
};
