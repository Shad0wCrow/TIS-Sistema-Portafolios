<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Crear el tipo ENUM grado_educacion si no existe
        DB::statement("DO \$\$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grado_educacion') THEN
                CREATE TYPE grado_educacion AS ENUM (
                    'titulo_bachiller',
                    'tecnico_medio',
                    'titulo_superior',
                    'licenciado',
                    'especialidad',
                    'maestria',
                    'doctorado',
                    'post_doctorado'
                );
            END IF;
        END \$\$");

        // Agregar la columna grado a la tabla educacion
        // NULL porque los registros existentes (incluidos cursos) no tienen grado asignado
        DB::statement("ALTER TABLE educacion ADD COLUMN IF NOT EXISTS grado grado_educacion NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE educacion DROP COLUMN IF EXISTS grado");
        DB::statement("DROP TYPE IF EXISTS grado_educacion");
    }
};