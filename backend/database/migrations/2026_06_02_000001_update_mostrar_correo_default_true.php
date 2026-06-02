<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE configuracion_privacidad ALTER COLUMN mostrar_correo SET DEFAULT true');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE configuracion_privacidad MODIFY mostrar_correo TINYINT(1) NOT NULL DEFAULT 1');
            return;
        }

        if ($driver === 'sqlite') {
            return;
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE configuracion_privacidad ALTER COLUMN mostrar_correo SET DEFAULT false');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE configuracion_privacidad MODIFY mostrar_correo TINYINT(1) NOT NULL DEFAULT 0');
        }
    }
};
