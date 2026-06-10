<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portafolio_publicacion', function (Blueprint $table) {
            $table->string('color_acento', 7)->nullable()->default(null)->after('enlace_activo');
        });
    }

    public function down(): void
    {
        Schema::table('portafolio_publicacion', function (Blueprint $table) {
            $table->dropColumn('color_acento');
        });
    }
};
