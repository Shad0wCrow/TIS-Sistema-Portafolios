<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('perfil', function (Blueprint $table) {
            $table->string('prefijo_celular', 10)->nullable()->after('pais');
        });
    }

    public function down(): void
    {
        Schema::table('perfil', function (Blueprint $table) {
            $table->dropColumn('prefijo_celular');
        });
    }
};
