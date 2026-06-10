<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEnlaceActivoToPortafolioPublicacion extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('portafolio_publicacion', function (Blueprint $table) {
        $table->boolean('enlace_activo')->default(false)->after('publicado');
    });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('portafolio_publicacion', function (Blueprint $table) {
            //
        });
    }
}
