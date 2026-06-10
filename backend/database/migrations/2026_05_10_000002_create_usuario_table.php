<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario', function (Blueprint $table) {
            $table->increments('id_usuario');
            $table->string('correo', 255)->unique();
            $table->string('nombre_usuario', 100)->unique();
            $table->string('contrasenia', 255);
            $table->string('rol', 50)->nullable();
            $table->boolean('eliminado')->default(false);
            $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};
