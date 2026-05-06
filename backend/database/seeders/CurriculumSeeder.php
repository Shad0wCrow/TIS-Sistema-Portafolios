<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Experiencia laboral, educación, certificaciones, logros e idiomas
 * para los 6 usuarios creados en UsuarioPerfilSeeder.
 */
class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Educación ────────────────────────────────────────────────
        DB::table('educacion')->insert([
            // Ana (1) - Ingeniería de Sistemas
            [
                'usuario_id'   => 1,
                'institucion'  => 'Universidad Mayor de San Simón',
                'titulo'       => 'Licenciatura en Ingeniería de Sistemas',
                'area_estudio' => 'Ingeniería de Software',
                'fecha_inicio' => '2015-02-01',
                'fecha_fin'    => '2019-12-15',
                'descripcion'  => 'Mención en desarrollo de software. Tesis sobre arquitecturas de microservicios en entornos cloud.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
            [
                'usuario_id'   => 1,
                'institucion'  => 'Platzi Master',
                'titulo'       => 'Programa de Liderazgo Tecnológico',
                'area_estudio' => 'Liderazgo y Gestión de Equipos Tech',
                'fecha_inicio' => '2021-01-01',
                'fecha_fin'    => '2021-09-30',
                'descripcion'  => 'Programa de 9 meses enfocado en soft skills para líderes técnicos.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
            // Carlos (2)
            [
                'usuario_id'   => 2,
                'institucion'  => 'Universidad Mayor de San Andrés',
                'titulo'       => 'Licenciatura en Informática',
                'area_estudio' => 'Desarrollo de Software',
                'fecha_inicio' => '2016-02-01',
                'fecha_fin'    => '2020-11-30',
                'descripcion'  => 'Énfasis en sistemas distribuidos y redes de computadoras.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
            // Lucía (3)
            [
                'usuario_id'   => 3,
                'institucion'  => 'Universidad Privada de Santa Cruz',
                'titulo'       => 'Licenciatura en Diseño Multimedia',
                'area_estudio' => 'Diseño Digital y Comunicación Visual',
                'fecha_inicio' => '2017-03-01',
                'fecha_fin'    => '2021-12-10',
                'descripcion'  => 'Especialización en UX Research y diseño de productos digitales.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
            // Diego (4)
            [
                'usuario_id'   => 4,
                'institucion'  => 'Universidad de Buenos Aires',
                'titulo'       => 'Licenciatura en Ciencias de la Computación',
                'area_estudio' => 'Ciencias de Datos',
                'fecha_inicio' => '2015-03-01',
                'fecha_fin'    => '2020-06-30',
                'descripcion'  => 'Tesis sobre modelos de aprendizaje automático aplicados a datos financieros.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
            [
                'usuario_id'   => 4,
                'institucion'  => 'Coursera / Johns Hopkins University',
                'titulo'       => 'Data Science Specialization',
                'area_estudio' => 'Ciencias de Datos',
                'fecha_inicio' => '2021-01-01',
                'fecha_fin'    => '2021-07-31',
                'descripcion'  => 'Especialización de 10 cursos en R, estadística y machine learning.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
            // Sofía (5)
            [
                'usuario_id'   => 5,
                'institucion'  => 'Universidad Nacional de Colombia',
                'titulo'       => 'Ingeniería de Sistemas y Computación',
                'area_estudio' => 'Desarrollo Móvil',
                'fecha_inicio' => '2016-02-01',
                'fecha_fin'    => '2021-05-15',
                'descripcion'  => 'Proyecto de grado: aplicación de salud móvil con Flutter.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
            // Mateo (6)
            [
                'usuario_id'   => 6,
                'institucion'  => 'Universidad Politécnica de Madrid',
                'titulo'       => 'Grado en Ingeniería Informática',
                'area_estudio' => 'Sistemas e Infraestructura',
                'fecha_inicio' => '2014-09-01',
                'fecha_fin'    => '2018-06-30',
                'descripcion'  => 'Especialidad en sistemas operativos, redes y computación en la nube.',
                'visibilidad'  => 'publico',
                'eliminado'    => false,
                'creado_en'    => now(),
                'actualizado_en' => now(),
            ],
        ]);

        // ─── Experiencia Laboral ──────────────────────────────────────
        // empresa_id según CatalogoSeeder:
        //   1=TechBolivia  2=InnovateSoft  3=DataVision  4=Freelance
        //   5=StartupLab   6=GlobalDev     7=EduTech

        DB::table('experiencia')->insert([
            // Ana (1)
            [
                'usuario_id'   => 1, 'empresa_id' => 1, 'tipo' => 'tiempo_completo',
                'puesto'       => 'Tech Lead Fullstack',
                'descripcion'  => 'Liderazgo de equipo de 6 desarrolladores. Arquitectura de la plataforma SaaS principal con Laravel + React. Implementación de CI/CD y revisiones de código.',
                'fecha_inicio' => '2022-01-01', 'fecha_fin' => null, 'es_actual' => true,
                'ubicacion'    => 'Cochabamba, Bolivia', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            [
                'usuario_id'   => 1, 'empresa_id' => 2, 'tipo' => 'tiempo_completo',
                'puesto'       => 'Desarrolladora Backend Senior',
                'descripcion'  => 'Desarrollo de APIs RESTful con Laravel. Migración de monolito a microservicios. Mentora de desarrolladores junior.',
                'fecha_inicio' => '2019-03-01', 'fecha_fin' => '2021-12-31', 'es_actual' => false,
                'ubicacion'    => 'La Paz, Bolivia', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            // Carlos (2)
            [
                'usuario_id'   => 2, 'empresa_id' => 2, 'tipo' => 'tiempo_completo',
                'puesto'       => 'Backend Developer',
                'descripcion'  => 'Desarrollo de microservicios con Node.js y Express. Diseño de esquemas en PostgreSQL y MongoDB. Integración con servicios de terceros.',
                'fecha_inicio' => '2021-06-01', 'fecha_fin' => null, 'es_actual' => true,
                'ubicacion'    => 'La Paz, Bolivia', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            [
                'usuario_id'   => 2, 'empresa_id' => 4, 'tipo' => 'freelance',
                'puesto'       => 'Desarrollador Freelance',
                'descripcion'  => 'Desarrollo de APIs personalizadas para startups latinoamericanas. Consultoría en arquitectura de software.',
                'fecha_inicio' => '2020-01-01', 'fecha_fin' => '2021-05-31', 'es_actual' => false,
                'ubicacion'    => 'Remoto', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            // Lucía (3)
            [
                'usuario_id'   => 3, 'empresa_id' => 6, 'tipo' => 'tiempo_completo',
                'puesto'       => 'Frontend Developer & UI Designer',
                'descripcion'  => 'Desarrollo de componentes reutilizables con Vue.js y Tailwind. Diseño de wireframes y prototipos en Figma. Implementación de sistema de diseño.',
                'fecha_inicio' => '2022-03-01', 'fecha_fin' => null, 'es_actual' => true,
                'ubicacion'    => 'Santa Cruz, Bolivia', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            [
                'usuario_id'   => 3, 'empresa_id' => 7, 'tipo' => 'medio_tiempo',
                'puesto'       => 'Diseñadora UI/UX',
                'descripcion'  => 'Diseño de interfaces para plataforma e-learning. Realización de pruebas de usabilidad con usuarios.',
                'fecha_inicio' => '2021-07-01', 'fecha_fin' => '2022-02-28', 'es_actual' => false,
                'ubicacion'    => 'Remoto', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            // Diego (4)
            [
                'usuario_id'   => 4, 'empresa_id' => 3, 'tipo' => 'tiempo_completo',
                'puesto'       => 'Data Engineer Senior',
                'descripcion'  => 'Diseño e implementación de pipelines ETL con Python y Apache Spark. Gestión de Data Warehouse en AWS Redshift. Construcción de dashboards en Power BI.',
                'fecha_inicio' => '2021-08-01', 'fecha_fin' => null, 'es_actual' => true,
                'ubicacion'    => 'Buenos Aires, Argentina', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            // Sofía (5)
            [
                'usuario_id'   => 5, 'empresa_id' => 5, 'tipo' => 'tiempo_completo',
                'puesto'       => 'Mobile Developer',
                'descripcion'  => 'Desarrollo de apps con Flutter para iOS y Android. Integración con APIs REST y Firebase. Publicación en App Store y Play Store.',
                'fecha_inicio' => '2022-04-01', 'fecha_fin' => null, 'es_actual' => true,
                'ubicacion'    => 'Bogotá, Colombia', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            [
                'usuario_id'   => 5, 'empresa_id' => 4, 'tipo' => 'freelance',
                'puesto'       => 'Desarrolladora Móvil Freelance',
                'descripcion'  => 'Desarrollo de apps React Native para clientes de Colombia y México. Integración con pasarelas de pago y notificaciones push.',
                'fecha_inicio' => '2021-03-01', 'fecha_fin' => '2022-03-31', 'es_actual' => false,
                'ubicacion'    => 'Remoto', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            // Mateo (6)
            [
                'usuario_id'   => 6, 'empresa_id' => 6, 'tipo' => 'tiempo_completo',
                'puesto'       => 'DevOps Engineer Senior',
                'descripcion'  => 'Diseño de infraestructura AWS con Terraform. Implementación de clústeres Kubernetes. Gestión de pipelines GitHub Actions y Jenkins.',
                'fecha_inicio' => '2020-09-01', 'fecha_fin' => null, 'es_actual' => true,
                'ubicacion'    => 'Madrid, España', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
            [
                'usuario_id'   => 6, 'empresa_id' => 2, 'tipo' => 'tiempo_completo',
                'puesto'       => 'Administrador de Sistemas Linux',
                'descripcion'  => 'Administración de servidores Linux. Monitoreo con Prometheus/Grafana. Automatización con Ansible y Bash.',
                'fecha_inicio' => '2018-07-01', 'fecha_fin' => '2020-08-31', 'es_actual' => false,
                'ubicacion'    => 'Madrid, España', 'visibilidad' => 'publico',
                'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now(),
            ],
        ]);

        // ─── Certificaciones ──────────────────────────────────────────
        // entidad_emisora_id: 1=Coursera 2=Udemy 3=Google 4=Meta 5=AWS 6=Microsoft 7=freeCodeCamp 8=Platzi 9=LinkedIn 10=Oracle
        DB::table('certificacion')->insert([
            ['usuario_id' => 1, 'entidad_emisora_id' => 1,  'nombre' => 'Meta Back-End Developer Professional Certificate', 'fecha_obtencion' => '2022-06-01', 'fecha_expiracion' => null,         'url_certificado' => 'https://coursera.org/verify/abc001', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'entidad_emisora_id' => 3,  'nombre' => 'Google Professional Cloud Developer',             'fecha_obtencion' => '2023-02-15', 'fecha_expiracion' => '2025-02-15', 'url_certificado' => 'https://google.com/cert/abc002',    'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'entidad_emisora_id' => 2,  'nombre' => 'Node.js: The Complete Guide (MVC, REST APIs, GraphQL)', 'fecha_obtencion' => '2021-04-10', 'fecha_expiracion' => null,    'url_certificado' => 'https://udemy.com/cert/abc003',     'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'entidad_emisora_id' => 7,  'nombre' => 'Back End Development and APIs',                   'fecha_obtencion' => '2022-09-20', 'fecha_expiracion' => null,         'url_certificado' => 'https://freecodecamp.org/cert/abc004','visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'entidad_emisora_id' => 9,  'nombre' => 'UX Design Fundamentals',                          'fecha_obtencion' => '2022-01-15', 'fecha_expiracion' => null,         'url_certificado' => 'https://linkedin.com/cert/abc005',  'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'entidad_emisora_id' => 3,  'nombre' => 'Google UX Design Professional Certificate',       'fecha_obtencion' => '2023-05-10', 'fecha_expiracion' => null,         'url_certificado' => 'https://coursera.org/verify/abc006', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'entidad_emisora_id' => 1,  'nombre' => 'IBM Data Science Professional Certificate',       'fecha_obtencion' => '2021-09-01', 'fecha_expiracion' => null,         'url_certificado' => 'https://coursera.org/verify/abc007', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'entidad_emisora_id' => 5,  'nombre' => 'AWS Certified Data Analytics – Specialty',       'fecha_obtencion' => '2022-11-20', 'fecha_expiracion' => '2025-11-20', 'url_certificado' => 'https://aws.amazon.com/cert/abc008', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'entidad_emisora_id' => 4,  'nombre' => 'Meta React Native Specialist',                   'fecha_obtencion' => '2022-07-01', 'fecha_expiracion' => null,         'url_certificado' => 'https://developers.facebook.com/cert/abc009','visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'entidad_emisora_id' => 3,  'nombre' => 'Google Associate Android Developer',             'fecha_obtencion' => '2023-01-12', 'fecha_expiracion' => '2026-01-12', 'url_certificado' => 'https://google.com/cert/abc010',    'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'entidad_emisora_id' => 5,  'nombre' => 'AWS Certified Solutions Architect – Associate',  'fecha_obtencion' => '2021-03-15', 'fecha_expiracion' => '2024-03-15', 'url_certificado' => 'https://aws.amazon.com/cert/abc011', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'entidad_emisora_id' => 5,  'nombre' => 'AWS Certified DevOps Engineer – Professional',  'fecha_obtencion' => '2022-08-10', 'fecha_expiracion' => '2025-08-10', 'url_certificado' => 'https://aws.amazon.com/cert/abc012', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'entidad_emisora_id' => 6,  'nombre' => 'Microsoft Certified: Azure Administrator',       'fecha_obtencion' => '2023-04-05', 'fecha_expiracion' => '2025-04-05', 'url_certificado' => 'https://learn.microsoft.com/cert/abc013','visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
        ]);

        // ─── Logros ───────────────────────────────────────────────────
        DB::table('logro')->insert([
            ['usuario_id' => 1, 'entidad_emisora_id' => 5, 'titulo' => '1er lugar – Hackathon TechBolivia 2023',        'descripcion' => 'Primer puesto en la categoría de soluciones sostenibles construyendo una app de gestión de residuos.',   'fecha_obtencion' => '2023-10-15', 'url_credencial' => null,                               'identificador' => 'HTB2023-01', 'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 1, 'entidad_emisora_id' => null,'titulo' => 'Speaker – DevConf Bolivia 2024',              'descripcion' => 'Charla sobre "Migración de monolitos a microservicios sin dolor" con más de 200 asistentes.',           'fecha_obtencion' => '2024-03-20', 'url_credencial' => 'https://devconf.bo/speakers/ana',  'identificador' => null,         'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 2, 'entidad_emisora_id' => null,'titulo' => 'Top Contributor – Laravel Bolivia Community', 'descripcion' => 'Reconocido como uno de los 5 contribuidores más activos de la comunidad Laravel en Bolivia.',           'fecha_obtencion' => '2023-06-01', 'url_credencial' => null,                               'identificador' => null,         'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 3, 'entidad_emisora_id' => null,'titulo' => '2do lugar – UX Challenge LATAM 2023',         'descripcion' => 'Segundo lugar en el reto de rediseño de app bancaria para usuarios adultos mayores.',                   'fecha_obtencion' => '2023-08-05', 'url_credencial' => 'https://uxlatam.com/resultados',  'identificador' => 'UXCH2023-02','visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 4, 'entidad_emisora_id' => null,'titulo' => 'Kaggle Competition – Top 5%',                 'descripcion' => 'Clasificó en el top 5% en la competencia "House Prices: Advanced Regression Techniques".',              'fecha_obtencion' => '2022-12-01', 'url_credencial' => 'https://kaggle.com/c/house-prices', 'identificador' => null,        'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 5, 'entidad_emisora_id' => null,'titulo' => 'App del Mes – Play Store Colombia',           'descripcion' => 'La app HealthTrack desarrollada para StartupLab fue destacada como "App del Mes" en Play Store Colombia.', 'fecha_obtencion' => '2023-09-01', 'url_credencial' => null,                               'identificador' => null,         'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
            ['usuario_id' => 6, 'entidad_emisora_id' => null,'titulo' => 'Speaker – KubeCon Europe 2024',               'descripcion' => 'Presentación sobre "Optimización de costos en clústeres Kubernetes productivos" en la conferencia global.','fecha_obtencion' => '2024-03-25', 'url_credencial' => 'https://kubecon.io/speakers/mateo','identificador' => null,        'visibilidad' => 'publico', 'eliminado' => false, 'creado_en' => now(), 'actualizado_en' => now()],
        ]);

        // ─── Idiomas de Usuarios ──────────────────────────────────────
        // idioma_id: 1=Español 2=Inglés 3=Portugués 4=Francés 5=Alemán 8=Japonés
        DB::table('usuario_idioma')->insert([
            // Ana
            ['usuario_id' => 1, 'idioma_id' => 1, 'nivel' => 'nativo',     'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 1, 'idioma_id' => 2, 'nivel' => 'b2',         'visibilidad' => 'publico', 'eliminado' => false],
            // Carlos
            ['usuario_id' => 2, 'idioma_id' => 1, 'nivel' => 'nativo',     'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 2, 'idioma_id' => 2, 'nivel' => 'b1',         'visibilidad' => 'publico', 'eliminado' => false],
            // Lucía
            ['usuario_id' => 3, 'idioma_id' => 1, 'nivel' => 'nativo',     'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 3, 'idioma_id' => 2, 'nivel' => 'b2',         'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 3, 'idioma_id' => 4, 'nivel' => 'a2',         'visibilidad' => 'publico', 'eliminado' => false],
            // Diego
            ['usuario_id' => 4, 'idioma_id' => 1, 'nivel' => 'nativo',     'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 4, 'idioma_id' => 2, 'nivel' => 'c1',         'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 4, 'idioma_id' => 3, 'nivel' => 'b1',         'visibilidad' => 'publico', 'eliminado' => false],
            // Sofía
            ['usuario_id' => 5, 'idioma_id' => 1, 'nivel' => 'nativo',     'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 5, 'idioma_id' => 2, 'nivel' => 'b2',         'visibilidad' => 'publico', 'eliminado' => false],
            // Mateo
            ['usuario_id' => 6, 'idioma_id' => 1, 'nivel' => 'nativo',     'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 6, 'idioma_id' => 2, 'nivel' => 'c2',         'visibilidad' => 'publico', 'eliminado' => false],
            ['usuario_id' => 6, 'idioma_id' => 5, 'nivel' => 'b1',         'visibilidad' => 'publico', 'eliminado' => false],
        ]);
    }
}
