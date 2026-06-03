<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Artisan;

class RankingVisitasSeeder extends Seeder
{
    private array $usuarios = [
        1 => [
            'correo'    => 'ranking.maria.gomez@portafolio.demo',
            'username'  => 'maria_gomez_ranking',
            'nombre'    => 'María',
            'apellido'  => 'Gómez',
            'profesion' => 'Cloud Architect',
            'descripcion' => 'Arquitecta cloud con amplia experiencia en AWS y GCP. Especialista en arquitecturas serverless, contenedores e infraestructura como código.',
            'celular'   => '76110001',
            'linkedin'  => 'maria-gomez-cloud',
            'visitas'   => 35,
            'habilidades' => [[17, 'experto', 6, 'Cloud', 'sí'], [13, 'avanzado', 4, 'DevOps', 'sí']],
            'proyectos' => [
                ['Arquitectura Serverless de Alta Disponibilidad', 'Diseño y despliegue de microservicios serverless usando AWS Lambda, API Gateway y DynamoDB.', 5],
            ],
        ],
        2 => [
            'correo'    => 'ranking.jose.perez@portafolio.demo',
            'username'  => 'jose_perez_ranking',
            'nombre'    => 'José',
            'apellido'  => 'Pérez',
            'profesion' => 'Fullstack Developer',
            'descripcion' => 'Desarrollador fullstack apasionado por crear aplicaciones web modernas, rápidas y accesibles con Laravel y React.',
            'celular'   => '76110002',
            'linkedin'  => 'jose-perez-fullstack',
            'visitas'   => 25,
            'habilidades' => [[2, 'experto', 5, 'Backend', 'sí'], [5, 'avanzado', 3, 'Frontend', 'sí']],
            'proyectos' => [
                ['Plataforma de E-Learning React/Laravel', 'Sistema educativo completo con videollamadas integradas, pasarela de pagos y gestión de cursos.', 1],
            ],
        ],
        3 => [
            'correo'    => 'ranking.ana.flores@portafolio.demo',
            'username'  => 'ana_flores_ranking',
            'nombre'    => 'Ana',
            'apellido'  => 'Flores',
            'profesion' => 'AI Engineer',
            'descripcion' => 'Ingeniera de Inteligencia Artificial y Machine Learning. Con experiencia en procesamiento de lenguaje natural y computer vision utilizando Python.',
            'celular'   => '76110003',
            'linkedin'  => 'ana-flores-ai',
            'visitas'   => 15,
            'habilidades' => [[8, 'experto', 4, 'Data/ML', 'sí'], [14, 'avanzado', 5, 'Herramientas', 'no']],
            'proyectos' => [
                ['Detector de Anomalías en Tiempo Real', 'Modelo de visión computacional para identificar defectos en líneas de ensamblaje industrial.', 4],
            ],
        ],
        4 => [
            'correo'    => 'ranking.pedro.garcia@portafolio.demo',
            'username'  => 'pedro_garcia_ranking',
            'nombre'    => 'Pedro',
            'apellido'  => 'García',
            'profesion' => 'Cyber Security Specialist',
            'descripcion' => 'Especialista en ciberseguridad, pruebas de penetración y hardening de servidores Linux. Apasionado por la criptografía.',
            'celular'   => '76110004',
            'linkedin'  => 'pedro-garcia-security',
            'visitas'   => 8,
            'habilidades' => [[18, 'experto', 5, 'Sistemas', 'sí'], [13, 'intermedio', 3, 'DevOps', 'no']],
            'proyectos' => [
                ['Auditoría Automatizada de Redes', 'Herramienta de escaneo y reporte de vulnerabilidades para infraestructuras cloud y locales.', 7],
            ],
        ],
    ];

    public function run(): void
    {
        // 1. Limpieza de datos previos (idempotencia)
        $userIds = DB::table('usuario')->whereIn('nombre_usuario', [
            'maria_gomez_ranking',
            'jose_perez_ranking',
            'ana_flores_ranking',
            'pedro_garcia_ranking'
        ])->pluck('id_usuario');

        if ($userIds->isNotEmpty()) {
            DB::table('portafolio_visualizacion_evento')->whereIn('usuario_id_propietario', $userIds)->delete();
            DB::table('proyecto_usuario')->whereIn('usuario_id', $userIds)->delete();
            DB::table('proyecto')->whereIn('usuario_id', $userIds)->delete();
            DB::table('usuario_idioma')->whereIn('usuario_id', $userIds)->delete();
            DB::table('experiencia')->whereIn('usuario_id', $userIds)->delete();
            DB::table('educacion')->whereIn('usuario_id', $userIds)->delete();
            DB::table('usuario_habilidad')->whereIn('usuario_id', $userIds)->delete();
            DB::table('portafolio_publicacion')->whereIn('usuario_id', $userIds)->delete();
            DB::table('configuracion_privacidad')->whereIn('usuario_id', $userIds)->delete();
            DB::table('perfil')->whereIn('usuario_id', $userIds)->delete();
            DB::table('usuario')->whereIn('id_usuario', $userIds)->delete();
        }

        // Periodo de visitas (mes anterior)
        $periodo   = now()->subMonth();
        $inicioMes = $periodo->copy()->startOfMonth();
        $daysInMonth = $inicioMes->daysInMonth;

        // 2. Inserción de usuarios
        foreach ($this->usuarios as $idx => $u) {
            $userId = DB::table('usuario')->insertGetId([
                'correo'         => $u['correo'],
                'nombre_usuario' => $u['username'],
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(2),
            ], 'id_usuario');

            // Perfil
            DB::table('perfil')->insert([
                'usuario_id'      => $userId,
                'nombre_perfil'   => $u['nombre'],
                'apellido_perfil' => $u['apellido'],
                'profesion'       => $u['profesion'],
                'descripcion'     => $u['descripcion'],
                'foto_url'        => "https://api.dicebear.com/7.x/avataaars/svg?seed={$u['username']}",
                'correo_contacto' => $u['correo'],
                'linkedin_url'    => "https://linkedin.com/in/{$u['linkedin']}",
                'celular'         => $u['celular'],
                'visibilidad'     => 'publico',
                'eliminado'       => false,
                'ciudad'          => 'Cochabamba',
                'pais'            => 'Bolivia',
                'prefijo_celular' => '+591',
            ]);

            // Privacidad
            DB::table('configuracion_privacidad')->insert([
                'usuario_id'                            => $userId,
                'mostrar_correo'                        => true,
                'mostrar_ubicacion'                     => true,
                'visibilidad_proyectos_por_defecto'     => 'publico',
                'visibilidad_habilidades_por_defecto'   => 'publico',
                'visibilidad_experiencias_por_defecto'  => 'publico',
                'visibilidad_logros_por_defecto'        => 'publico',
                'seccion_perfil'                        => 'publico',
                'seccion_proyectos'                     => 'publico',
                'seccion_habilidades'                   => 'publico',
                'seccion_experiencia'                   => 'publico',
                'seccion_educacion'                     => 'publico',
                'seccion_cursos'                        => 'publico',
                'seccion_certificaciones'               => 'publico',
                'seccion_logros'                        => 'publico',
                'seccion_idiomas'                       => 'publico',
                'created_at'                            => now(),
                'updated_at'                            => now(),
            ]);

            // Publicación del Portafolio
            $slug = str_replace('_', '-', $u['username']);
            $publicacionId = DB::table('portafolio_publicacion')->insertGetId([
                'usuario_id'      => $userId,
                'slug_publico'    => $slug,
                'publicado'       => true,
                'publicado_en'    => now()->subMonth()->startOfMonth(),
                'despublicado_en' => null,
                'creado_en'       => now()->subMonth(),
                'actualizado_en'  => now(),
            ], 'id_publicacion');

            // Habilidades
            foreach ($u['habilidades'] as [$hid, $nivel, $anos, $cat, $dest]) {
                DB::table('usuario_habilidad')->insert([
                    'usuario_id'       => $userId,
                    'habilidad_id'     => $hid,
                    'nivel'            => $nivel,
                    'anos_experiencia' => $anos,
                    'categoria'        => $cat,
                    'destacado'        => $dest,
                    'visibilidad'      => 'publico',
                    'eliminado'        => false,
                    'creado_en'        => now(),
                    'actualizado_en'   => now(),
                ]);
            }

            // Idiomas (Español e Inglés)
            DB::table('usuario_idioma')->insert([
                [
                    'usuario_id'  => $userId,
                    'idioma_id'   => 1, // Español
                    'nivel'       => 'nativo',
                    'visibilidad' => 'publico',
                    'eliminado'   => false,
                ],
                [
                    'usuario_id'  => $userId,
                    'idioma_id'   => 2, // Inglés
                    'nivel'       => 'b2',
                    'visibilidad' => 'publico',
                    'eliminado'   => false,
                ]
            ]);

            // Educación
            DB::table('educacion')->insert([
                'usuario_id'   => $userId,
                'institucion'  => 'Universidad Mayor de San Simón',
                'titulo'       => 'Licenciatura en Ingeniería de Sistemas',
                'area_estudio' => 'Ciencias de la Computación',
                'grado'        => 'licenciado',
                'fecha_inicio' => '2018-02-01',
                'fecha_fin'    => '2022-12-15',
                'descripcion'  => 'Estudios completos de grado en Sistemas.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
            ]);

            // Experiencia (empresa_id: 1=TechBolivia)
            DB::table('experiencia')->insert([
                'usuario_id'   => $userId,
                'empresa_id'   => 1,
                'tipo'         => 'tiempo_completo',
                'puesto'       => $u['profesion'] . ' Senior',
                'descripcion'  => 'Trabajo en desarrollo, despliegues y liderazgo técnico.',
                'fecha_inicio' => '2023-01-15',
                'fecha_fin'    => null,
                'es_actual'    => true,
                'ubicacion'    => 'Cochabamba, Bolivia',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
            ]);

            // Proyectos
            foreach ($u['proyectos'] as $orden => $p) {
                $pSlug = strtolower(str_replace([' ', '–', '/'], ['-', '-', '-'], $p[0]));
                $proyectoId = DB::table('proyecto')->insertGetId([
                    'usuario_id'      => $userId,
                    'categoria_id'    => $p[2],
                    'titulo'          => $p[0],
                    'descripcion'     => $p[1],
                    'fecha_inicio'    => '2023-06-01',
                    'fecha_fin'       => '2023-12-01',
                    'repositorio_url' => "https://github.com/{$u['username']}/{$pSlug}",
                    'demo_url'        => "https://demo.portafolio.dev/{$u['username']}/" . ($orden + 1),
                    'visibilidad'     => 'publico',
                    'eliminado'       => false,
                    'creado_en'       => now(),
                ], 'id_proyecto');

                DB::table('proyecto_usuario')->insert([
                    'proyecto_id'    => $proyectoId,
                    'usuario_id'     => $userId,
                    'rol_proyecto'   => 'Desarrollador Principal',
                    'es_propietario' => true,
                ]);
            }

            // 3. Generación de visitas en el mes anterior
            for ($i = 0; $i < $u['visitas']; $i++) {
                // Distribución aleatoria sobre los días del mes anterior
                $fechaVisita = $inicioMes->copy()->addDays(rand(0, $daysInMonth - 1))->toDateString();

                DB::table('portafolio_visualizacion_evento')->insert([
                    'publicacion_id'          => $publicacionId,
                    'usuario_id_propietario'  => $userId,
                    'usuario_id_visitante'    => null,
                    'slug_publico'            => $slug,
                    'session_key'             => 'session_ranking_' . $userId . '_' . $i,
                    'fecha_visita'            => $fechaVisita,
                    'ip_hash'                 => md5('ip_' . $userId . '_' . $i),
                    'user_agent'              => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'creado_en'               => now()->subMonth(),
                ]);
            }
        }

        // 4. Calcular y cerrar el ranking del mes anterior automáticamente
        Artisan::call('ranking:cerrar-mes');
    }
}
