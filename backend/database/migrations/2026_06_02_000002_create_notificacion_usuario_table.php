<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificacion_usuario', function (Blueprint $table) {
            $table->increments('id_notificacion');
            $table->unsignedInteger('usuario_id');
            $table->unsignedInteger('reporte_id')->nullable();
            $table->string('tipo', 60)->default('reporte_portafolio');
            $table->string('titulo', 180);
            $table->text('mensaje');
            $table->string('slug_publico', 120)->nullable();
            $table->string('portafolio_nombre', 255)->nullable();
            $table->boolean('leida')->default(false);
            $table->timestamp('leida_en')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('usuario_id')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('cascade');

            $table->foreign('reporte_id')
                ->references('id_reporte')
                ->on('reporte_portafolio')
                ->onDelete('set null');

            $table->index(['usuario_id', 'leida', 'creado_en'], 'idx_notificacion_usuario_estado');
            $table->index('reporte_id', 'idx_notificacion_reporte');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificacion_usuario');
    }
};
