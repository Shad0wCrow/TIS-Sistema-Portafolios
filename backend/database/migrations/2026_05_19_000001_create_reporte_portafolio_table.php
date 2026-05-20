<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reporte_portafolio', function (Blueprint $table) {
            $table->increments('id_reporte');

            // Portafolio reportado
            $table->unsignedInteger('publicacion_id');
            $table->foreign('publicacion_id')
                ->references('id_publicacion')
                ->on('portafolio_publicacion')
                ->onDelete('cascade');

            // Usuario que reporta (nullable: visitante sin cuenta)
            $table->unsignedInteger('reportado_por')->nullable();
            $table->foreign('reportado_por')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null');

            // Motivo de la denuncia (enum abierto con check)
            $table->string('motivo', 60);

            // Comentario adicional opcional
            $table->text('comentario')->nullable();

            // Estado de revisión: pendiente | revisado | desestimado
            $table->string('estado', 30)->default('pendiente');

            // Administrador/moderador que procesó el reporte
            $table->unsignedInteger('revisado_por')->nullable();
            $table->foreign('revisado_por')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null');

            // Nota interna del moderador al resolver
            $table->text('nota_moderador')->nullable();

            $table->timestamp('creado_en')->useCurrent();
            $table->timestamp('revisado_en')->nullable();
        });

        // Índices útiles para el panel admin
        Schema::table('reporte_portafolio', function (Blueprint $table) {
            $table->index('estado',          'idx_reporte_estado');
            $table->index('publicacion_id',  'idx_reporte_publicacion');
            $table->index('creado_en',       'idx_reporte_fecha');

            // Evita reportes duplicados por el mismo usuario al mismo portafolio
            $table->unique(
                ['publicacion_id', 'reportado_por'],
                'uq_reporte_publicacion_usuario'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reporte_portafolio');
    }
};
