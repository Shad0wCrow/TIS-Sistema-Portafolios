<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddApellidoAndCelularToPerfilTable extends Migration
{
    public function up()
    {
        Schema::table('perfil', function (Blueprint $table) {
            if (!Schema::hasColumn('perfil', 'apellido_perfil')) {
                $table->string('apellido_perfil', 255)->nullable()->after('nombre_perfil');
            }

            if (!Schema::hasColumn('perfil', 'celular')) {
                $table->string('celular', 20)->nullable()->after('profesion');
            }
        });
    }

    public function down()
    {
        Schema::table('perfil', function (Blueprint $table) {
            if (Schema::hasColumn('perfil', 'celular')) {
                $table->dropColumn('celular');
            }

            if (Schema::hasColumn('perfil', 'apellido_perfil')) {
                $table->dropColumn('apellido_perfil');
            }
        });
    }
}
