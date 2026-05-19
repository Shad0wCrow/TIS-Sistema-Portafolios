<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $correo = 'admin@devfolio.local';

        $admin = DB::table('usuario')->where('correo', $correo)->first();

        if ($admin) {
            DB::table('usuario')
                ->where('id_usuario', $admin->id_usuario)
                ->update([
                    'nombre_usuario' => 'admin',
                    'rol' => 'admin',
                    'eliminado' => false,
                ]);

            return;
        }

        DB::table('usuario')->insert([
            'correo' => $correo,
            'nombre_usuario' => 'admin',
            'contrasenia' => Hash::make('Admin123!'),
            'rol' => 'admin',
            'eliminado' => false,
            'creado_en' => now(),
        ]);
    }
}
