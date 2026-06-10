<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Crear el ENUM rol_curso solo para cursos (area_estudio='curso')
        // Para educación formal, este campo queda NULL
        DB::statement("DO \$\$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_curso') THEN
                CREATE TYPE rol_curso AS ENUM (
                    'estudiante',
                    'auxiliar',
                    'docente',
                    'profesor',
                    'no_aplica'
                );
            END IF;
        END \$\$");

        DB::statement("ALTER TABLE educacion ADD COLUMN IF NOT EXISTS rol_curso rol_curso NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE educacion DROP COLUMN IF EXISTS rol_curso");
        DB::statement("DROP TYPE IF EXISTS rol_curso");
    }
};
