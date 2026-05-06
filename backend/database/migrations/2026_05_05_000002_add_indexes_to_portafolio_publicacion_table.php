<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portafolio_publicacion', function (Blueprint $table) {
            $table->index(['publicado', 'publicado_en'], 'idx_publicacion_publicado_fecha');
        });
    }

    public function down(): void
    {
        Schema::table('portafolio_publicacion', function (Blueprint $table) {
            $table->dropIndex('idx_publicacion_publicado_fecha');
        });
    }
};
