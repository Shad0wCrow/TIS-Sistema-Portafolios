<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Tablas de catálogo sin dependencia de usuario.
 * Deben sembrarse antes de cualquier dato de usuario.
 */
class CatalogoSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Idiomas ──────────────────────────────────────────────────
        $idiomas = [
            'Español', 'Inglés', 'Portugués', 'Francés',
            'Alemán', 'Italiano', 'Chino Mandarín', 'Japonés',
        ];

        DB::table('idioma')->insert(
            array_map(fn($n) => ['nombre' => $n], $idiomas)
        );

        // ─── Habilidades ──────────────────────────────────────────────
        // La tabla habilidad no tiene creado_en — se quitó ese campo
        $habilidades = [
            // Técnicas
            ['nombre' => 'PHP',                     'tipo' => 'tecnica', 'descripcion' => 'Lenguaje de programación del lado del servidor'],
            ['nombre' => 'Laravel',                  'tipo' => 'tecnica', 'descripcion' => 'Framework PHP para desarrollo web'],
            ['nombre' => 'JavaScript',               'tipo' => 'tecnica', 'descripcion' => 'Lenguaje de programación web'],
            ['nombre' => 'TypeScript',               'tipo' => 'tecnica', 'descripcion' => 'Superset tipado de JavaScript'],
            ['nombre' => 'React',                    'tipo' => 'tecnica', 'descripcion' => 'Librería de UI para JavaScript'],
            ['nombre' => 'Vue.js',                   'tipo' => 'tecnica', 'descripcion' => 'Framework progresivo de JavaScript'],
            ['nombre' => 'Node.js',                  'tipo' => 'tecnica', 'descripcion' => 'Entorno de ejecución JavaScript en el servidor'],
            ['nombre' => 'Python',                   'tipo' => 'tecnica', 'descripcion' => 'Lenguaje de programación de propósito general'],
            ['nombre' => 'Django',                   'tipo' => 'tecnica', 'descripcion' => 'Framework web en Python'],
            ['nombre' => 'PostgreSQL',               'tipo' => 'tecnica', 'descripcion' => 'Base de datos relacional'],
            ['nombre' => 'MySQL',                    'tipo' => 'tecnica', 'descripcion' => 'Base de datos relacional de código abierto'],
            ['nombre' => 'MongoDB',                  'tipo' => 'tecnica', 'descripcion' => 'Base de datos NoSQL orientada a documentos'],
            ['nombre' => 'Docker',                   'tipo' => 'tecnica', 'descripcion' => 'Plataforma de contenedores'],
            ['nombre' => 'Git',                      'tipo' => 'tecnica', 'descripcion' => 'Sistema de control de versiones'],
            ['nombre' => 'REST APIs',                'tipo' => 'tecnica', 'descripcion' => 'Diseño y consumo de APIs RESTful'],
            ['nombre' => 'GraphQL',                  'tipo' => 'tecnica', 'descripcion' => 'Lenguaje de consulta para APIs'],
            ['nombre' => 'AWS',                      'tipo' => 'tecnica', 'descripcion' => 'Plataforma de servicios en la nube de Amazon'],
            ['nombre' => 'Linux',                    'tipo' => 'tecnica', 'descripcion' => 'Sistema operativo de código abierto'],
            ['nombre' => 'UI/UX Design',             'tipo' => 'tecnica', 'descripcion' => 'Diseño de interfaces y experiencia de usuario'],
            ['nombre' => 'Figma',                    'tipo' => 'tecnica', 'descripcion' => 'Herramienta de diseño colaborativo'],
            // Blandas
            ['nombre' => 'Liderazgo',                'tipo' => 'blanda',  'descripcion' => 'Capacidad de guiar y motivar equipos'],
            ['nombre' => 'Comunicación',             'tipo' => 'blanda',  'descripcion' => 'Transmisión efectiva de ideas'],
            ['nombre' => 'Trabajo en equipo',        'tipo' => 'blanda',  'descripcion' => 'Colaboración para alcanzar objetivos comunes'],
            ['nombre' => 'Resolución de problemas',  'tipo' => 'blanda',  'descripcion' => 'Análisis y solución eficiente de obstáculos'],
            ['nombre' => 'Gestión del tiempo',       'tipo' => 'blanda',  'descripcion' => 'Organización y priorización de tareas'],
            ['nombre' => 'Adaptabilidad',            'tipo' => 'blanda',  'descripcion' => 'Capacidad de ajustarse a nuevos entornos'],
            ['nombre' => 'Creatividad',              'tipo' => 'blanda',  'descripcion' => 'Generación de ideas innovadoras'],
        ];

        DB::table('habilidad')->insert($habilidades);

        // ─── Empresas ─────────────────────────────────────────────────
        DB::table('empresa')->insert([
            ['nombre' => 'TechBolivia S.R.L.',      'descripcion' => 'Empresa de desarrollo de software en Bolivia',      'sitio_web' => 'https://techbolivia.com'],
            ['nombre' => 'InnovateSoft',             'descripcion' => 'Consultora de transformación digital',              'sitio_web' => 'https://innovatesoft.io'],
            ['nombre' => 'DataVision Corp',          'descripcion' => 'Empresa especializada en análisis de datos',        'sitio_web' => 'https://datavision.com'],
            ['nombre' => 'Freelance / Independiente','descripcion' => 'Trabajo por cuenta propia',                         'sitio_web' => null],
            ['nombre' => 'StartupLab Incubadora',    'descripcion' => 'Incubadora de startups tecnológicas',              'sitio_web' => 'https://startuplab.bo'],
            ['nombre' => 'GlobalDev Agency',         'descripcion' => 'Agencia de desarrollo web y móvil a nivel global', 'sitio_web' => 'https://globaldev.agency'],
            ['nombre' => 'EduTech Bolivia',          'descripcion' => 'Plataforma de educación tecnológica',              'sitio_web' => 'https://edutech.bo'],
        ]);

        // ─── Entidades Emisoras de Certificados/Logros ────────────────
        // La tabla entidad_emisora no tiene creado_en — se quitó ese campo
        DB::table('entidad_emisora')->insert([
            ['nombre' => 'Coursera',          'sitio_web' => 'https://coursera.org'],
            ['nombre' => 'Udemy',             'sitio_web' => 'https://udemy.com'],
            ['nombre' => 'Google',            'sitio_web' => 'https://grow.google'],
            ['nombre' => 'Meta',              'sitio_web' => 'https://developers.facebook.com'],
            ['nombre' => 'AWS (Amazon)',      'sitio_web' => 'https://aws.amazon.com/certification'],
            ['nombre' => 'Microsoft',         'sitio_web' => 'https://learn.microsoft.com'],
            ['nombre' => 'freeCodeCamp',      'sitio_web' => 'https://freecodecamp.org'],
            ['nombre' => 'Platzi',            'sitio_web' => 'https://platzi.com'],
            ['nombre' => 'LinkedIn Learning', 'sitio_web' => 'https://linkedin.com/learning'],
            ['nombre' => 'Oracle',            'sitio_web' => 'https://education.oracle.com'],
        ]);

        // ─── Categorías de Proyecto ───────────────────────────────────
        DB::table('categoria_proyecto')->insert([
            ['nombre' => 'Aplicación Web',    'descripcion' => 'Proyectos de desarrollo web fullstack o frontend'],
            ['nombre' => 'Aplicación Móvil',  'descripcion' => 'Apps para Android e iOS'],
            ['nombre' => 'API / Backend',     'descripcion' => 'Servicios REST, GraphQL o microservicios'],
            ['nombre' => 'Data Science / ML', 'descripcion' => 'Análisis de datos y machine learning'],
            ['nombre' => 'DevOps / Infra',    'descripcion' => 'Automatización, CI/CD e infraestructura'],
            ['nombre' => 'Diseño UI/UX',      'descripcion' => 'Prototipado y diseño de interfaces'],
            ['nombre' => 'Open Source',       'descripcion' => 'Contribuciones o proyectos de código abierto'],
            ['nombre' => 'Herramienta / CLI', 'descripcion' => 'Scripts y herramientas de línea de comandos'],
        ]);

    }
}