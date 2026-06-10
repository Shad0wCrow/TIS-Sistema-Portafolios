<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificacion', function (Blueprint $table) {
            $table->increments('id_certificacion');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('entidad_emisora_id')->nullable();
            $table->string('nombre', 150);
            $table->date('fecha_obtencion')->nullable();
            $table->date('fecha_expiracion')->nullable();
            $table->string('url_certificado', 500)->nullable();
            $table->boolean('eliminado')->default(false);

            $table->foreign('usuario_id')->references('id_usuario')->on('usuario');
            $table->foreign('entidad_emisora_id')->references('id_entidad_emisora')->on('entidad_emisora');
        });

        DB::statement("ALTER TABLE certificacion ADD COLUMN visibilidad estado_visibilidad DEFAULT 'publico'");
    }

    public function down(): void
    {
        Schema::dropIfExists('certificacion');
    }
};
