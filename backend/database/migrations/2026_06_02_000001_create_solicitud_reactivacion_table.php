<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitud_reactivacion', function (Blueprint $table) {
            $table->increments('id_solicitud');
            $table->unsignedInteger('usuario_id');
            $table->text('mensaje');
            $table->string('estado', 20)->default('pendiente'); // pendiente | aceptada | rechazada
            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('revisado_en')->nullable();
            $table->unsignedInteger('admin_id')->nullable();

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('admin_id')->references('id_usuario')->on('usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitud_reactivacion');
    }
};