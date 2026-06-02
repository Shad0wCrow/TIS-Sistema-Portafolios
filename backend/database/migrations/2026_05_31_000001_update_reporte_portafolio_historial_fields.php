<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reporte_portafolio', function (Blueprint $table) {
            if (!Schema::hasColumn('reporte_portafolio', 'usuario_reportado_id')) {
                $table->unsignedInteger('usuario_reportado_id')->nullable()->after('publicacion_id');
            }

            if (!Schema::hasColumn('reporte_portafolio', 'slug_publico_snapshot')) {
                $table->string('slug_publico_snapshot', 120)->nullable()->after('usuario_reportado_id');
            }

            if (!Schema::hasColumn('reporte_portafolio', 'nombre_reportado_snapshot')) {
                $table->string('nombre_reportado_snapshot', 255)->nullable()->after('slug_publico_snapshot');
            }

            if (!Schema::hasColumn('reporte_portafolio', 'nombre_usuario_reportado_snapshot')) {
                $table->string('nombre_usuario_reportado_snapshot', 100)->nullable()->after('nombre_reportado_snapshot');
            }

            if (!Schema::hasColumn('reporte_portafolio', 'reportado_por_snapshot')) {
                $table->string('reportado_por_snapshot', 100)->nullable()->after('reportado_por');
            }

            if (!Schema::hasColumn('reporte_portafolio', 'ip_reportante')) {
                $table->string('ip_reportante', 45)->nullable()->after('comentario');
            }

            if (!Schema::hasColumn('reporte_portafolio', 'user_agent_reportante')) {
                $table->string('user_agent_reportante', 500)->nullable()->after('ip_reportante');
            }
        });

        $this->hacerPublicacionNullable();
        $this->backfillSnapshots();
        $this->agregarForeignKeysEIndices();
    }

    public function down(): void
    {
        $this->dropForeignIfExists('reporte_portafolio_usuario_reportado_id_foreign');
        $this->dropForeignIfExists('reporte_portafolio_publicacion_id_foreign');

        Schema::table('reporte_portafolio', function (Blueprint $table) {
            $this->dropIndexIfExists($table, 'idx_reporte_usuario_reportado');
            $this->dropIndexIfExists($table, 'idx_reporte_reportante');

            foreach ([
                'usuario_reportado_id',
                'slug_publico_snapshot',
                'nombre_reportado_snapshot',
                'nombre_usuario_reportado_snapshot',
                'reportado_por_snapshot',
                'ip_reportante',
                'user_agent_reportante',
            ] as $column) {
                if (Schema::hasColumn('reporte_portafolio', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        $this->hacerPublicacionRequerida();
        $this->agregarForeignKeyPublicacionCascade();
    }

    private function hacerPublicacionNullable(): void
    {
        $this->dropForeignIfExists('reporte_portafolio_publicacion_id_foreign');

        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE reporte_portafolio ALTER COLUMN publicacion_id DROP NOT NULL');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE reporte_portafolio MODIFY publicacion_id INT UNSIGNED NULL');
        }
    }

    private function hacerPublicacionRequerida(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE reporte_portafolio ALTER COLUMN publicacion_id SET NOT NULL');
            return;
        }

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE reporte_portafolio MODIFY publicacion_id INT UNSIGNED NOT NULL');
        }
    }

    private function backfillSnapshots(): void
    {
        $reportes = DB::table('reporte_portafolio as r')
            ->leftJoin('portafolio_publicacion as pp', 'pp.id_publicacion', '=', 'r.publicacion_id')
            ->leftJoin('usuario as u', 'u.id_usuario', '=', 'pp.usuario_id')
            ->leftJoin('perfil as p', function ($join) {
                $join->on('p.usuario_id', '=', 'u.id_usuario')
                    ->where('p.eliminado', false);
            })
            ->leftJoin('usuario as reporter', 'reporter.id_usuario', '=', 'r.reportado_por')
            ->select([
                'r.id_reporte',
                'pp.usuario_id',
                'pp.slug_publico',
                'u.nombre_usuario as nombre_usuario_reportado',
                'p.nombre_perfil',
                'p.apellido_perfil',
                'reporter.nombre_usuario as reportado_por_nombre',
            ])
            ->get();

        foreach ($reportes as $reporte) {
            $nombre = trim(($reporte->nombre_perfil ?? '') . ' ' . ($reporte->apellido_perfil ?? ''));

            DB::table('reporte_portafolio')
                ->where('id_reporte', $reporte->id_reporte)
                ->update([
                    'usuario_reportado_id' => $reporte->usuario_id,
                    'slug_publico_snapshot' => $reporte->slug_publico,
                    'nombre_reportado_snapshot' => $nombre !== '' ? $nombre : $reporte->nombre_usuario_reportado,
                    'nombre_usuario_reportado_snapshot' => $reporte->nombre_usuario_reportado,
                    'reportado_por_snapshot' => $reporte->reportado_por_nombre,
                ]);
        }
    }

    private function agregarForeignKeysEIndices(): void
    {
        Schema::table('reporte_portafolio', function (Blueprint $table) {
            $table->foreign('publicacion_id')
                ->references('id_publicacion')
                ->on('portafolio_publicacion')
                ->onDelete('set null');

            $table->foreign('usuario_reportado_id')
                ->references('id_usuario')
                ->on('usuario')
                ->onDelete('set null');

            $table->index('usuario_reportado_id', 'idx_reporte_usuario_reportado');
            $table->index('reportado_por', 'idx_reporte_reportante');
        });
    }

    private function agregarForeignKeyPublicacionCascade(): void
    {
        Schema::table('reporte_portafolio', function (Blueprint $table) {
            $table->foreign('publicacion_id')
                ->references('id_publicacion')
                ->on('portafolio_publicacion')
                ->onDelete('cascade');
        });
    }

    private function dropForeignIfExists(string $constraint): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE reporte_portafolio DROP CONSTRAINT IF EXISTS {$constraint}");
            return;
        }

        if ($driver === 'mysql') {
            try {
                DB::statement("ALTER TABLE reporte_portafolio DROP FOREIGN KEY {$constraint}");
            } catch (Throwable $e) {
                // La migracion debe ser tolerante si corre contra una BD parcialmente actualizada.
            }
        }
    }

    private function dropIndexIfExists(Blueprint $table, string $index): void
    {
        try {
            $table->dropIndex($index);
        } catch (Throwable $e) {
            // Laravel no ofrece un dropIndex condicional portable para todos los drivers.
        }
    }
};
