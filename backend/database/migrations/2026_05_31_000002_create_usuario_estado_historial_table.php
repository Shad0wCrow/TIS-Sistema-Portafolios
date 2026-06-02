<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario_estado_historial', function (Blueprint $table) {
            $table->increments('id_evento');

            $table->unsignedInteger('usuario_id')->nullable();
            $table->foreign('usuario_id')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null');

            $table->unsignedInteger('admin_id')->nullable();
            $table->foreign('admin_id')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null');

            $table->unsignedInteger('reporte_id')->nullable();
            $table->foreign('reporte_id')
                ->references('id_reporte')
                ->on('reporte_portafolio')
                ->onDelete('set null');

            $table->string('accion', 30);
            $table->string('estado_anterior', 30);
            $table->string('estado_nuevo', 30);
            $table->string('origen', 60)->default('gestion_usuarios');
            $table->string('motivo', 255)->nullable();
            $table->text('detalle')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->index('usuario_id', 'idx_usuario_estado_hist_usuario');
            $table->index('admin_id', 'idx_usuario_estado_hist_admin');
            $table->index('reporte_id', 'idx_usuario_estado_hist_reporte');
            $table->index('accion', 'idx_usuario_estado_hist_accion');
            $table->index('creado_en', 'idx_usuario_estado_hist_fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario_estado_historial');
    }
};
