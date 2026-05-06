<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Crea 6 usuarios con sus perfiles, configuración de privacidad
 * y enlaces personalizados.
 *
 * IDs resultantes (SERIAL empieza en 1):
 *   1 → Ana Torres       (admin, Cochabamba)
 *   2 → Carlos Mendoza   (developer, La Paz)
 *   3 → Lucia Vargas     (developer, Santa Cruz)
 *   4 → Diego Quispe     (developer, Buenos Aires)
 *   5 → Sofia Romero     (developer, Bogotá)
 *   6 → Mateo Fernández  (developer, Madrid)
 */
class UsuarioPerfilSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Usuarios ─────────────────────────────────────────────────
        // region_id referencia la tabla region (sembrada por PaisRegionSeeder)
        // Bolivia:    region 1=La Paz, 2=Cochabamba, 3=Santa Cruz
        // Argentina:  region 10=Buenos Aires
        // Colombia:   region 15=Bogotá
        // España:     region 23=Madrid
        $usuarios = [
            [
                'correo'         => 'ana.torres@portafolio.dev',
                'nombre_usuario' => 'ana_torres',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'admin',
                'region_id'      => 2,   // Cochabamba, Bolivia
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(6),
                'actualizado_en' => now()->subMonths(6),
            ],
            [
                'correo'         => 'carlos.mendoza@portafolio.dev',
                'nombre_usuario' => 'carlos_mendoza',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'region_id'      => 1,   // La Paz, Bolivia
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(5),
                'actualizado_en' => now()->subMonths(5),
            ],
            [
                'correo'         => 'lucia.vargas@portafolio.dev',
                'nombre_usuario' => 'lucia_vargas',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'region_id'      => 3,   // Santa Cruz, Bolivia
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(4),
                'actualizado_en' => now()->subMonths(4),
            ],
            [
                'correo'         => 'diego.quispe@portafolio.dev',
                'nombre_usuario' => 'diego_quispe',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'region_id'      => 10,  // Buenos Aires, Argentina
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(3),
                'actualizado_en' => now()->subMonths(3),
            ],
            [
                'correo'         => 'sofia.romero@portafolio.dev',
                'nombre_usuario' => 'sofia_romero',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'region_id'      => 15,  // Bogotá, Colombia
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(2),
                'actualizado_en' => now()->subMonths(2),
            ],
            [
                'correo'         => 'mateo.fernandez@portafolio.dev',
                'nombre_usuario' => 'mateo_fernandez',
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'region_id'      => 23,  // Madrid, España
                'eliminado'      => false,
                'creado_en'      => now()->subMonth(),
                'actualizado_en' => now()->subMonth(),
            ],
        ];

        DB::table('usuario')->insert($usuarios);

        // ─── Perfiles ─────────────────────────────────────────────────
        $perfiles = [
            [
                'usuario_id'      => 1,
                'nombre_perfil'   => 'Ana',
                'apellido_perfil' => 'Torres',
                'profesion'       => 'Fullstack Developer & Tech Lead',
                'descripcion'     => 'Desarrolladora fullstack con más de 5 años de experiencia en Laravel y React. Apasionada por la arquitectura de software limpia y la mentoría de equipos.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
                'banner_url'      => null,
                'correo_contacto' => 'ana.torres@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/ana-torres-dev',
                'celular'         => '+591 70000001',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
                'creado_en'       => now()->subMonths(6),
                'actualizado_en'  => now()->subDays(2),
            ],
            [
                'usuario_id'      => 2,
                'nombre_perfil'   => 'Carlos',
                'apellido_perfil' => 'Mendoza',
                'profesion'       => 'Backend Developer',
                'descripcion'     => 'Especialista en Node.js, microservicios y bases de datos. Disfruto construir APIs robustas y escalables. Contribuidor activo a proyectos open source.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
                'banner_url'      => null,
                'correo_contacto' => 'carlos.mendoza@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/carlos-mendoza-dev',
                'celular'         => '+591 70000002',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
                'creado_en'       => now()->subMonths(5),
                'actualizado_en'  => now()->subDays(5),
            ],
            [
                'usuario_id'      => 3,
                'nombre_perfil'   => 'Lucía',
                'apellido_perfil' => 'Vargas',
                'profesion'       => 'Frontend Developer & UI Designer',
                'descripcion'     => 'Creo interfaces modernas con Vue.js y Tailwind. Me enfoco en la accesibilidad y la experiencia del usuario. Diseñadora autodidacta con ojo para el detalle.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucia',
                'banner_url'      => null,
                'correo_contacto' => 'lucia.vargas@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/lucia-vargas-dev',
                'celular'         => '+591 70000003',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
                'creado_en'       => now()->subMonths(4),
                'actualizado_en'  => now()->subDays(1),
            ],
            [
                'usuario_id'      => 4,
                'nombre_perfil'   => 'Diego',
                'apellido_perfil' => 'Quispe',
                'profesion'       => 'Data Engineer',
                'descripcion'     => 'Trabajo con Python y Spark para procesar grandes volúmenes de datos. Experiencia en pipelines ETL, visualización y modelos predictivos.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego',
                'banner_url'      => null,
                'correo_contacto' => 'diego.quispe@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/diego-quispe-data',
                'celular'         => '+54 9 11 00000004',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
                'creado_en'       => now()->subMonths(3),
                'actualizado_en'  => now()->subWeek(),
            ],
            [
                'usuario_id'      => 5,
                'nombre_perfil'   => 'Sofía',
                'apellido_perfil' => 'Romero',
                'profesion'       => 'Mobile Developer (Android & iOS)',
                'descripcion'     => 'Desarrollo aplicaciones móviles multiplataforma con Flutter y React Native. Me apasiona la performance y la experiencia nativa.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
                'banner_url'      => null,
                'correo_contacto' => 'sofia.romero@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/sofia-romero-mobile',
                'celular'         => '+57 300 0000005',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
                'creado_en'       => now()->subMonths(2),
                'actualizado_en'  => now()->subDays(3),
            ],
            [
                'usuario_id'      => 6,
                'nombre_perfil'   => 'Mateo',
                'apellido_perfil' => 'Fernández',
                'profesion'       => 'DevOps & Cloud Engineer',
                'descripcion'     => 'Especialista en Docker, Kubernetes y AWS. Construyo pipelines CI/CD eficientes y arquitecturas cloud-native. Speaker en conferencias de infraestructura.',
                'foto_url'        => 'https://api.dicebear.com/7.x/avataaars/svg?seed=mateo',
                'banner_url'      => null,
                'correo_contacto' => 'mateo.fernandez@portafolio.dev',
                'linkedin_url'    => 'https://linkedin.com/in/mateo-fernandez-devops',
                'celular'         => '+34 600 000006',
                'visibilidad'     => 'publico',
                'eliminado'       => false,
                'creado_en'       => now()->subMonth(),
                'actualizado_en'  => now()->subDays(4),
            ],
        ];

        DB::table('perfil')->insert($perfiles);

        // ─── Configuración de Privacidad ──────────────────────────────
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
                'creado_en'                             => now()->subMonths(7 - $i),
                'actualizado_en'                        => now()->subMonths(7 - $i),
            ];
        }

        DB::table('configuracion_privacidad')->insert($configs);

        // ─── Enlaces Personalizados ───────────────────────────────────
        DB::table('enlace_personalizado')->insert([
            // Ana (1)
            ['usuario_id' => 1, 'titulo' => 'GitHub',    'url' => 'https://github.com/ana-torres',     'nombre_icono' => 'github',   'orden' => 1, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'titulo' => 'Portfolio', 'url' => 'https://anatorres.dev',             'nombre_icono' => 'globe',    'orden' => 2, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            // Carlos (2)
            ['usuario_id' => 2, 'titulo' => 'GitHub',    'url' => 'https://github.com/carlos-mendoza', 'nombre_icono' => 'github',   'orden' => 1, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'titulo' => 'npm',       'url' => 'https://npmjs.com/~carlos_mendoza', 'nombre_icono' => 'npm',      'orden' => 2, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            // Lucía (3)
            ['usuario_id' => 3, 'titulo' => 'Behance',   'url' => 'https://behance.net/lucia_vargas',  'nombre_icono' => 'behance',  'orden' => 1, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'titulo' => 'Dribbble',  'url' => 'https://dribbble.com/lucia_vargas', 'nombre_icono' => 'dribbble', 'orden' => 2, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            // Diego (4)
            ['usuario_id' => 4, 'titulo' => 'Kaggle',    'url' => 'https://kaggle.com/diegoquispe',    'nombre_icono' => 'kaggle',   'orden' => 1, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            // Sofía (5)
            ['usuario_id' => 5, 'titulo' => 'GitHub',    'url' => 'https://github.com/sofia-romero',   'nombre_icono' => 'github',   'orden' => 1, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            // Mateo (6)
            ['usuario_id' => 6, 'titulo' => 'GitHub',    'url' => 'https://github.com/mateo-fernandez','nombre_icono' => 'github',   'orden' => 1, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'titulo' => 'Blog',      'url' => 'https://mateofernandez.tech',       'nombre_icono' => 'globe',    'orden' => 2, 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
        ]);
    }
}
