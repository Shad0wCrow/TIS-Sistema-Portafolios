<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('idioma', function (Blueprint $table) {
            $table->increments('id_idioma');
            $table->string('nombre', 100)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idioma');
    }
};
