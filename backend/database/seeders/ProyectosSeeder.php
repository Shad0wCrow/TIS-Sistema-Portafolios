<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Proyectos + tablas relacionadas:
 *   proyecto_usuario, proyecto_tecnologia, proyecto_habilidad,
 *   proyecto_tag, evidencia.
 *
 * categoria_id:  1=Web  2=Móvil  3=API/Backend  4=Data/ML  5=DevOps  6=UI/UX  7=OpenSource  8=Herramienta
 *
 * tecnologia_id (por orden de inserción en CatalogoSeeder):
 *   1=PHP  2=JS  3=TS  4=Python  5=Java  6=Kotlin  7=Swift
 *   8=Laravel  9=React  10=Vue.js  11=Angular  12=Django  13=Node.js  14=Express.js
 *  15=PostgreSQL  16=MySQL  17=MongoDB  18=Redis  19=Docker  20=Kubernetes
 *  21=AWS  22=Firebase  23=Tailwind  24=Bootstrap  25=Git  26=Figma  27=Postman
 *
 * habilidad_id: igual que en HabilidadesSeeder (ver mapa al inicio de ese archivo)
 *
 * tag_id (por orden de inserción en CatalogoSeeder):
 *   1=fullstack 2=frontend 3=backend 4=mobile 5=api
 *   6=open-source 7=e-commerce 8=dashboard 9=machine-learning 10=devops
 *  11=responsive 12=pwa 13=saas 14=crud 15=real-time
 *  16=blockchain 17=iot 18=chatbot 19=seguridad 20=accesibilidad
 */
class ProyectosSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Proyectos ────────────────────────────────────────────────
        DB::table('proyecto')->insert([
            // Ana (1) – Proyecto 1
            [
                'usuario_id' => 1, 'categoria_id' => 3,
                'titulo'     => 'PortafolioAPI – Backend REST para portafolios profesionales',
                'descripcion'=> 'API RESTful construida con Laravel que gestiona usuarios, proyectos, habilidades y visibilidad pública de portafolios. Incluye autenticación JWT, roles y permisos.',
                'fecha_inicio' => '2023-09-01', 'fecha_fin' => null,
                'estado'     => 'en_progreso',
                'repositorio_url' => 'https://github.com/ana-torres/portafolio-api',
                'demo_url'        => 'https://api.anatorres.dev/docs',
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Ana (1) – Proyecto 2
            [
                'usuario_id' => 1, 'categoria_id' => 1,
                'titulo'     => 'EduConnect – Plataforma de gestión escolar',
                'descripcion'=> 'Sistema web fullstack para gestión de estudiantes, calificaciones y comunicados. Desarrollado con Laravel (backend) y React (frontend). Implementa notificaciones en tiempo real con Pusher.',
                'fecha_inicio' => '2022-03-01', 'fecha_fin' => '2022-11-30',
                'estado'     => 'finalizado',
                'repositorio_url' => 'https://github.com/ana-torres/educonnect',
                'demo_url'        => 'https://educonnect-demo.vercel.app',
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Carlos (2) – Proyecto 3
            [
                'usuario_id' => 2, 'categoria_id' => 3,
                'titulo'     => 'MicroCommerce – Ecosistema de microservicios para e-commerce',
                'descripcion'=> 'Arquitectura de microservicios con Node.js. Servicios: auth, catálogo, pedidos, pagos y notificaciones. Orquestados con Docker Compose y comunicación asíncrona vía RabbitMQ.',
                'fecha_inicio' => '2022-06-01', 'fecha_fin' => '2023-04-30',
                'estado'     => 'finalizado',
                'repositorio_url' => 'https://github.com/carlos-mendoza/micro-commerce',
                'demo_url'        => null,
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Carlos (2) – Proyecto 4
            [
                'usuario_id' => 2, 'categoria_id' => 8,
                'titulo'     => 'pg-migrate-cli – Herramienta CLI de migraciones para PostgreSQL',
                'descripcion'=> 'CLI open source en Node.js para gestionar migraciones de bases de datos PostgreSQL con soporte de rollback, dry-run y generación automática de scripts desde esquemas.',
                'fecha_inicio' => '2023-01-01', 'fecha_fin' => null,
                'estado'     => 'en_progreso',
                'repositorio_url' => 'https://github.com/carlos-mendoza/pg-migrate-cli',
                'demo_url'        => null,
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Lucía (3) – Proyecto 5
            [
                'usuario_id' => 3, 'categoria_id' => 6,
                'titulo'     => 'FinanceUI – Design System para apps financieras',
                'descripcion'=> 'Sistema de diseño completo en Figma + implementación en Vue.js y Tailwind CSS. Incluye 50+ componentes accesibles (WCAG 2.1 AA), guía de tokens y storybook interactivo.',
                'fecha_inicio' => '2023-03-01', 'fecha_fin' => '2023-12-31',
                'estado'     => 'finalizado',
                'repositorio_url' => 'https://github.com/lucia-vargas/finance-ui',
                'demo_url'        => 'https://finance-ui.vercel.app',
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Lucía (3) – Proyecto 6
            [
                'usuario_id' => 3, 'categoria_id' => 1,
                'titulo'     => 'ShopVue – Tienda online PWA con Vue.js',
                'descripcion'=> 'E-commerce Progressive Web App construida con Vue 3 + Pinia. Carrito de compras, búsqueda en tiempo real, checkout con Stripe y modo offline con Service Workers.',
                'fecha_inicio' => '2024-01-01', 'fecha_fin' => null,
                'estado'     => 'en_progreso',
                'repositorio_url' => 'https://github.com/lucia-vargas/shopvue',
                'demo_url'        => 'https://shopvue-preview.netlify.app',
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Diego (4) – Proyecto 7
            [
                'usuario_id' => 4, 'categoria_id' => 4,
                'titulo'     => 'SalesForecaster – Predicción de ventas con ML',
                'descripcion'=> 'Pipeline de machine learning en Python para predicción de ventas minoristas. Usa Prophet y XGBoost. Incluye ETL de datos, feature engineering y dashboard en Streamlit.',
                'fecha_inicio' => '2023-05-01', 'fecha_fin' => '2023-10-31',
                'estado'     => 'finalizado',
                'repositorio_url' => 'https://github.com/diegoquispe/sales-forecaster',
                'demo_url'        => 'https://sales-forecaster.streamlit.app',
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Diego (4) – Proyecto 8
            [
                'usuario_id' => 4, 'categoria_id' => 1,
                'titulo'     => 'DataViz Dashboard – Visualización interactiva de métricas de negocio',
                'descripcion'=> 'Dashboard web con Python (Flask) + Chart.js para visualización de KPIs empresariales. Conecta con PostgreSQL y soporta exportación a PDF/Excel.',
                'fecha_inicio' => '2022-09-01', 'fecha_fin' => '2023-03-31',
                'estado'     => 'finalizado',
                'repositorio_url' => 'https://github.com/diegoquispe/dataviz-dashboard',
                'demo_url'        => null,
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Sofía (5) – Proyecto 9
            [
                'usuario_id' => 5, 'categoria_id' => 2,
                'titulo'     => 'HealthTrack – App de seguimiento de salud personal',
                'descripcion'=> 'Aplicación móvil multiplataforma con Flutter. Registro de actividad física, sueño y alimentación. Integrada con Google Fit y Apple Health. Backend con Firebase.',
                'fecha_inicio' => '2022-10-01', 'fecha_fin' => '2023-07-31',
                'estado'     => 'finalizado',
                'repositorio_url' => 'https://github.com/sofia-romero/healthtrack',
                'demo_url'        => 'https://play.google.com/store/apps/details?id=co.healthtrack',
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Sofía (5) – Proyecto 10
            [
                'usuario_id' => 5, 'categoria_id' => 2,
                'titulo'     => 'EventoApp – App de gestión de eventos con QR',
                'descripcion'=> 'App React Native para organización y asistencia a eventos. Tickets con QR, check-in offline, agenda y notificaciones push con OneSignal.',
                'fecha_inicio' => '2023-08-01', 'fecha_fin' => null,
                'estado'     => 'en_progreso',
                'repositorio_url' => 'https://github.com/sofia-romero/evento-app',
                'demo_url'        => null,
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Mateo (6) – Proyecto 11
            [
                'usuario_id' => 6, 'categoria_id' => 5,
                'titulo'     => 'K8s-AutoScaler – Auto-scaling inteligente para Kubernetes',
                'descripcion'=> 'Operador de Kubernetes que implementa HPA personalizado basado en métricas de negocio (no solo CPU/RAM). Escrito en Go con el Operator SDK. Publicado en OperatorHub.',
                'fecha_inicio' => '2023-11-01', 'fecha_fin' => null,
                'estado'     => 'en_progreso',
                'repositorio_url' => 'https://github.com/mateo-fernandez/k8s-autoscaler',
                'demo_url'        => null,
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
            // Mateo (6) – Proyecto 12
            [
                'usuario_id' => 6, 'categoria_id' => 5,
                'titulo'     => 'TerraformBolivia – Módulos Terraform para AWS en LATAM',
                'descripcion'=> 'Colección de módulos Terraform reutilizables para desplegar infraestructura AWS optimizada para latencia en LATAM. Incluye VPC, EKS, RDS y WAF preconfigurados.',
                'fecha_inicio' => '2023-01-01', 'fecha_fin' => '2023-09-30',
                'estado'     => 'finalizado',
                'repositorio_url' => 'https://github.com/mateo-fernandez/terraform-bolivia',
                'demo_url'        => null,
                'imagen_principal_url' => null,
                'visibilidad' => 'publico', 'eliminado' => false,
                
            ],
        ]);

        // ─── proyecto_usuario (propietarios) ─────────────────────────
        // Cada usuario es propietario de sus propios proyectos
        // proyecto_id: 1..12 en el mismo orden de inserción arriba
        $propietarios = [
            [1, 1], [1, 2],   // Ana → proyectos 1, 2
            [2, 3], [2, 4],   // Carlos → proyectos 3, 4
            [3, 5], [3, 6],   // Lucía → proyectos 5, 6
            [4, 7], [4, 8],   // Diego → proyectos 7, 8
            [5, 9], [5, 10],  // Sofía → proyectos 9, 10
            [6, 11],[6, 12],  // Mateo → proyectos 11, 12
        ];

        $rows = [];
        foreach ($propietarios as [$uid, $pid]) {
            $rows[] = [
                'usuario_id'  => $uid,
                'proyecto_id' => $pid,
                'rol_proyecto' => 'propietario',
                'es_propietario' => true,
            ];
        }

        // Colaboraciones cruzadas (enriquecen el modelo)
        $colaboradores = [
            ['usuario_id' => 2, 'proyecto_id' => 1, 'rol_proyecto' => 'colaborador', 'es_propietario' => false],  // Carlos colabora en PortafolioAPI de Ana
            ['usuario_id' => 3, 'proyecto_id' => 2, 'rol_proyecto' => 'diseñador',   'es_propietario' => false],  // Lucía diseña en EduConnect de Ana
            ['usuario_id' => 1, 'proyecto_id' => 3, 'rol_proyecto' => 'revisor',     'es_propietario' => false],  // Ana revisa MicroCommerce de Carlos
            ['usuario_id' => 4, 'proyecto_id' => 8, 'rol_proyecto' => 'propietario', 'es_propietario' => true],   // Diego ya es propietario de DataViz
            ['usuario_id' => 5, 'proyecto_id' => 9, 'rol_proyecto' => 'propietario', 'es_propietario' => true],   // Sofía ya es propietaria de HealthTrack
            ['usuario_id' => 3, 'proyecto_id' => 6, 'rol_proyecto' => 'propietario', 'es_propietario' => true],   // Lucía propietaria ShopVue
        ];

        foreach ($colaboradores as $c) {
           
            $rows[] = $c;
        }

        DB::table('proyecto_usuario')->insert($rows);

        

      
    }
}
