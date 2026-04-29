<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCelularToPerfilTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
        public function up()
        {
            // Vacía intencionalmente.
            // Las columnas `celular` y `apellido_perfil` fueron movidas a:
            // 2026_04_22_000001_add_apellido_and_celular_to_perfil_table.php
        }

        public function down()
        {
            // Vacía intencionalmente. Ver migración del 2026_04_22.
        }
}
