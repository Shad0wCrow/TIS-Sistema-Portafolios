<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habilidad', function (Blueprint $table) {
            $table->increments('id_habilidad');
            $table->string('nombre', 100)->unique();
            $table->text('descripcion')->nullable();
        });

        DB::statement("ALTER TABLE habilidad ADD COLUMN tipo tipo_habilidad");
    }

    public function down(): void
    {
        Schema::dropIfExists('habilidad');
    }
};
