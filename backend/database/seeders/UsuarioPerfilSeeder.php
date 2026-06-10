<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Crea 6 usuarios con sus perfiles y configuración de privacidad.
 *
 * IDs resultantes (SERIAL empieza en 1):
 *   1 → Ana Torres       (admin)
 *   2 → Carlos Mendoza   (developer)
 *   3 → Lucia Vargas     (developer)
 *   4 → Diego Quispe     (developer)
 *   5 → Sofia Romero     (developer)
 *   6 → Mateo Fernández  (developer)
 *
 * Columnas eliminadas respecto al seeder original:
 *   usuario              → sin actualizado_en, sin region_id (tabla no existe)
 *   perfil               → sin creado_en, sin actualizado_en, sin banner_url
 *   configuracion_privacidad → usa created_at/updated_at (Eloquent), sin creado_en/actualizado_en
 *   enlace_personalizado → eliminado (tabla no existe en migraciones)
 */
class UsuarioPerfilSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Usuarios ─────────────────────────────────────────────────
        // Columnas reales: id_usuario, correo, nombre_usuario, contrasenia, rol, eliminado, creado_en
        DB::table('usuario')->insert([
            [
                'correo'         => 'ana.torres@portafolio.dev',
                'nombre_usuario' => 'ana_torres',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'admin',
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(6),
            ],
            [
                'correo'         => 'carlos.mendoza@portafolio.dev',
                'nombre_usuario' => 'carlos_mendoza',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(5),
            ],
            [
                'correo'         => 'lucia.vargas@portafolio.dev',
                'nombre_usuario' => 'lucia_vargas',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(4),
            ],
            [
                'correo'         => 'diego.quispe@portafolio.dev',
                'nombre_usuario' => 'diego_quispe',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(3),
            ],
            [
                'correo'         => 'sofia.romero@portafolio.dev',
                'nombre_usuario' => 'sofia_romero',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(2),
            ],
            [
                'correo'         => 'mateo.fernandez@portafolio.dev',
                'nombre_usuario' => 'mateo_fernandez',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'eliminado'      => false,
                'creado_en'      => now()->subMonth(),
            ],
        ]);

        // ─── Perfiles ─────────────────────────────────────────────────
        // Columnas reales: id_perfil, usuario_id, nombre_perfil, apellido_perfil,
        //                  profesion, celular, descripcion, foto_url,
        //                  correo_contacto, linkedin_url, eliminado, visibilidad
        DB::table('perfil')->insert([
            [
                'usuario_id'      => 1,
                'nombre_perfil'   => 'Ana',
                'apellido_perfil' => 'Torres',
                'profesion'       => 'Fullstack Developer & Tech Lead',
                'descripcion'     => 'Desarrolladora fullstack con más de 5 años de experiencia en Laravel y React. Apasionada por la arquitectura de software limpia y la mentoría de equipos.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
                'correo_contacto' => 'ana.torres@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/ana-torres-dev',
                'celular'         => '+591 70000001',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
            ],
            [
                'usuario_id'      => 2,
                'nombre_perfil'   => 'Carlos',
                'apellido_perfil' => 'Mendoza',
                'profesion'       => 'Backend Developer',
                'descripcion'     => 'Especialista en Node.js, microservicios y bases de datos. Disfruto construir APIs robustas y escalables. Contribuidor activo a proyectos open source.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
                'correo_contacto' => 'carlos.mendoza@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/carlos-mendoza-dev',
                'celular'         => '+591 70000002',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
            ],
            [
                'usuario_id'      => 3,
                'nombre_perfil'   => 'Lucía',
                'apellido_perfil' => 'Vargas',
                'profesion'       => 'Frontend Developer & UI Designer',
                'descripcion'     => 'Creo interfaces modernas con Vue.js y Tailwind. Me enfoco en la accesibilidad y la experiencia del usuario. Diseñadora autodidacta con ojo para el detalle.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia',
                'correo_contacto' => 'lucia.vargas@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/lucia-vargas-dev',
                'celular'         => '+591 70000003',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
            ],
            [
                'usuario_id'      => 4,
                'nombre_perfil'   => 'Diego',
                'apellido_perfil' => 'Quispe',
                'profesion'       => 'Data Engineer',
                'descripcion'     => 'Trabajo con Python y Spark para procesar grandes volúmenes de datos. Experiencia en pipelines ETL, visualización y modelos predictivos.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego',
                'correo_contacto' => 'diego.quispe@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/diego-quispe-data',
                'celular'         => '+54 9 11 00000004',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
            ],
            [
                'usuario_id'      => 5,
                'nombre_perfil'   => 'Sofía',
                'apellido_perfil' => 'Romero',
                'profesion'       => 'Mobile Developer (Android & iOS)',
                'descripcion'     => 'Desarrollo aplicaciones móviles multiplataforma con Flutter y React Native. Me apasiona la performance y la experiencia nativa.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
                'correo_contacto' => 'sofia.romero@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/sofia-romero-mobile',
                'celular'         => '+57 300 0000005',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
            ],
            [
                'usuario_id'      => 6,
                'nombre_perfil'   => 'Mateo',
                'apellido_perfil' => 'Fernández',
                'profesion'       => 'DevOps & Cloud Engineer',
                'descripcion'     => 'Especialista en Docker, Kubernetes y AWS. Construyo pipelines CI/CD eficientes y arquitecturas cloud-native. Speaker en conferencias de infraestructura.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateo',
                'correo_contacto' => 'mateo.fernandez@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/mateo-fernandez-devops',
                'celular'         => '+34 600 000006',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
            ],
        ]);

        // ─── Configuración de Privacidad ──────────────────────────────
        // Columnas reales: id_configuracion, usuario_id, mostrar_correo,
        //   mostrar_ubicacion, visibilidad_*_por_defecto (ENUM),
        //   seccion_* (varchar), created_at, updated_at
        $configs = [];
        for ($i = 1; $i <= 6; $i++) {
            $configs[] = [
                'usuario_id'                            => $i,
                'mostrar_correo'                        => ($i <= 3),
                'mostrar_ubicacion'                     => ($i <= 4),
                'visibilidad_proyectos_por_defecto'     => 'publico',
                'visibilidad_habilidades_por_defecto'   => 'publico',
                'visibilidad_experiencias_por_defecto'  => ($i <= 3) ? 'publico' : 'privado',
                'visibilidad_logros_por_defecto'        => 'publico',
                'created_at'                            => now(),
                'updated_at'                            => now(),
            ];
        }

        DB::table('configuracion_privacidad')->insert($configs);
    }
}