<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // migrate:fresh drops tables but NOT custom types.
        // Use DO blocks to create only if they don't already exist.
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_visibilidad') THEN CREATE TYPE estado_visibilidad AS ENUM ('publico', 'privado'); END IF; END $$");
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_habilidad') THEN CREATE TYPE nivel_habilidad AS ENUM ('basico', 'intermedio', 'avanzado', 'experto'); END IF; END $$");
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_habilidad') THEN CREATE TYPE tipo_habilidad AS ENUM ('tecnica', 'blanda'); END IF; END $$");
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_proyecto') THEN CREATE TYPE estado_proyecto AS ENUM ('en_progreso', 'finalizado', 'pausado'); END IF; END $$");
        DB::statement("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_idioma') THEN CREATE TYPE nivel_idioma AS ENUM ('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'nativo'); END IF; END $$");
         DB::statement("DO \$\$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grado_educacion') THEN CREATE TYPE grado_educacion AS ENUM (
            'titulo_bachiller',
            'tecnico_medio',
            'titulo_superior',
            'licenciado',
            'especialidad',
            'maestria',
            'doctorado',
            'post_doctorado'
            'otro'
        ); END IF; END \$\$");
    
    }

    public function down(): void
    {
        DB::statement("DROP TYPE IF EXISTS grado_educacion");
        DB::statement("DROP TYPE IF EXISTS nivel_idioma");
        DB::statement("DROP TYPE IF EXISTS estado_proyecto");
        DB::statement("DROP TYPE IF EXISTS tipo_habilidad");
        DB::statement("DROP TYPE IF EXISTS nivel_habilidad");
        DB::statement("DROP TYPE IF EXISTS estado_visibilidad");
    }
};
