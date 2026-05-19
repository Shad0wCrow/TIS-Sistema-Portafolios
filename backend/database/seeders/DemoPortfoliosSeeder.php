<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Crea 10 usuarios de demostración con portafolios publicados y completos.
 * Cada usuario tiene: perfil, privacidad, publicación, habilidades,
 * experiencia, educación, certificaciones, logros, idiomas y proyectos.
 *
 * IDs de usuario generados: 7–16 (los 6 primeros los crea UsuarioPerfilSeeder).
 *
 * Referencias de catálogo (CatalogoSeeder):
 *   Empresas:   1=TechBolivia  2=InnovateSoft  3=DataVision  4=Freelance
 *               5=StartupLab   6=GlobalDev      7=EduTech
 *   Entidades:  1=Coursera  2=Udemy  3=Google  4=Meta  5=AWS
 *               6=Microsoft  7=freeCodeCamp  8=Platzi  9=LinkedIn  10=Oracle
 *   Habilidades (id):
 *     1=PHP  2=Laravel  3=JavaScript  4=TypeScript  5=React  6=Vue.js
 *     7=Node.js  8=Python  9=Django  10=PostgreSQL  11=MySQL  12=MongoDB
 *     13=Docker  14=Git  15=REST APIs  16=GraphQL  17=AWS  18=Linux
 *     19=UI/UX  20=Figma  21=Liderazgo  22=Comunicación  23=Trabajo equipo
 *     24=Resolución problemas  25=Gestión tiempo  26=Adaptabilidad  27=Creatividad
 *   Idiomas:  1=Español  2=Inglés  3=Portugués  4=Francés  5=Alemán
 *   Categorías proyecto: 1=Web  2=Móvil  3=API/Backend  4=Data/ML
 *                        5=DevOps  6=Diseño UI/UX  7=Open Source  8=CLI
 */
class DemoPortfoliosSeeder extends Seeder
{
    // ─── Datos fijos por usuario ──────────────────────────────────────────────
    private array $usuarios = [
        1 => [
            'correo'    => 'demo.valentina.rios@portafolio.demo',
            'username'  => 'valentina_rios',
            'nombre'    => 'Valentina',
            'apellido'  => 'Ríos',
            'profesion' => 'Frontend Developer',
            'descripcion' => 'Desarrolladora frontend especializada en React y animaciones CSS. Me apasiona construir interfaces fluidas y accesibles. Actualmente explorando el mundo del diseño de sistemas.',
            'celular'   => '+591 76100001',
            'linkedin'  => 'valentina-rios-dev',
        ],
        2 => [
            'correo'    => 'demo.rodrigo.salinas@portafolio.demo',
            'username'  => 'rodrigo_salinas',
            'nombre'    => 'Rodrigo',
            'apellido'  => 'Salinas',
            'profesion' => 'Backend Developer',
            'descripcion' => 'Desarrollador backend con foco en APIs escalables con Laravel y Node.js. Amante de las buenas prácticas y el código limpio. Contribuidor open source en tiempos libres.',
            'celular'   => '+591 76100002',
            'linkedin'  => 'rodrigo-salinas-backend',
        ],
        3 => [
            'correo'    => 'demo.camila.vega@portafolio.demo',
            'username'  => 'camila_vega',
            'nombre'    => 'Camila',
            'apellido'  => 'Vega',
            'profesion' => 'UI/UX Designer',
            'descripcion' => 'Diseñadora UX con background en psicología cognitiva. Creo experiencias centradas en el usuario usando Figma y prototipado de alta fidelidad. Speaker en meetups de diseño.',
            'celular'   => '+591 76100003',
            'linkedin'  => 'camila-vega-ux',
        ],
        4 => [
            'correo'    => 'demo.andres.paredes@portafolio.demo',
            'username'  => 'andres_paredes',
            'nombre'    => 'Andrés',
            'apellido'  => 'Paredes',
            'profesion' => 'Data Scientist',
            'descripcion' => 'Científico de datos con experiencia en machine learning y visualización. Trabajo con Python, Spark y modelos predictivos para empresas del sector financiero y retail.',
            'celular'   => '+54 9 11 76100004',
            'linkedin'  => 'andres-paredes-data',
        ],
        5 => [
            'correo'    => 'demo.isabella.mora@portafolio.demo',
            'username'  => 'isabella_mora',
            'nombre'    => 'Isabella',
            'apellido'  => 'Mora',
            'profesion' => 'Mobile Developer',
            'descripcion' => 'Desarrolladora móvil especializada en Flutter y React Native. He publicado 4 apps en producción en Google Play y App Store. Apasionada por la performance y las animaciones nativas.',
            'celular'   => '+57 300 7610005',
            'linkedin'  => 'isabella-mora-mobile',
        ],
        6 => [
            'correo'    => 'demo.gabriel.nunez@portafolio.demo',
            'username'  => 'gabriel_nunez',
            'nombre'    => 'Gabriel',
            'apellido'  => 'Núñez',
            'profesion' => 'DevOps Engineer',
            'descripcion' => 'Ingeniero DevOps con expertise en Kubernetes, Terraform y AWS. Construyo pipelines CI/CD robustos y arquitecturas cloud-native. Certificado AWS Solutions Architect y DevOps Professional.',
            'celular'   => '+34 600 761006',
            'linkedin'  => 'gabriel-nunez-devops',
        ],
        7 => [
            'correo'    => 'demo.lucia.mendez@portafolio.demo',
            'username'  => 'lucia_mendez',
            'nombre'    => 'Lucía',
            'apellido'  => 'Méndez',
            'profesion' => 'Fullstack Developer',
            'descripcion' => 'Desarrolladora fullstack con Vue.js y Laravel. Me gusta construir productos completos desde el diseño hasta el despliegue. Experiencia en startups y trabajo remoto para clientes de LATAM.',
            'celular'   => '+591 76100007',
            'linkedin'  => 'lucia-mendez-fullstack',
        ],
        8 => [
            'correo'    => 'demo.sebastian.flores@portafolio.demo',
            'username'  => 'sebastian_flores',
            'nombre'    => 'Sebastián',
            'apellido'  => 'Flores',
            'profesion' => 'QA Engineer',
            'descripcion' => 'Ingeniero QA con enfoque en automatización de pruebas con Cypress y Playwright. Evangelista de la calidad del software y las metodologías ágiles. Certificado ISTQB Foundation.',
            'celular'   => '+52 55 7610008',
            'linkedin'  => 'sebastian-flores-qa',
        ],
        9 => [
            'correo'    => 'demo.natalia.cruz@portafolio.demo',
            'username'  => 'natalia_cruz',
            'nombre'    => 'Natalia',
            'apellido'  => 'Cruz',
            'profesion' => 'Cloud Architect',
            'descripcion' => 'Arquitecta cloud con especialización en AWS y Google Cloud. Diseño soluciones escalables y de alta disponibilidad. Triple certificada en AWS y apasionada por el serverless y los microservicios.',
            'celular'   => '+56 9 76100009',
            'linkedin'  => 'natalia-cruz-cloud',
        ],
        10 => [
            'correo'    => 'demo.matias.gutierrez@portafolio.demo',
            'username'  => 'matias_gutierrez',
            'nombre'    => 'Matías',
            'apellido'  => 'Gutiérrez',
            'profesion' => 'Product Manager',
            'descripcion' => 'Product Manager con background técnico en desarrollo web. Lidero equipos multidisciplinarios y defino roadmaps de producto usando metodologías ágiles. Apasionado por el product thinking.',
            'celular'   => '+598 99 7610010',
            'linkedin'  => 'matias-gutierrez-pm',
        ],
    ];

    // ─── Habilidades: [habilidad_id, nivel, anos_exp, categoria, destacado] ──
    private array $habilidades = [
        1  => [[3,'experto',5,'Frontend','sí'],[4,'avanzado',3,'Frontend','sí'],[5,'experto',4,'Frontend','sí'],[19,'avanzado',3,'Diseño','no'],[20,'intermedio',2,'Diseño','no'],[14,'avanzado',5,'Herramientas','no'],[27,'avanzado',5,'Blandas','sí'],[22,'avanzado',5,'Blandas','no']],
        2  => [[1,'experto',5,'Backend','sí'],[2,'experto',4,'Backend','sí'],[7,'avanzado',3,'Backend','sí'],[10,'avanzado',4,'Bases de Datos','sí'],[15,'experto',5,'Backend','no'],[13,'avanzado',3,'DevOps','no'],[14,'experto',5,'Herramientas','no'],[24,'avanzado',5,'Blandas','no']],
        3  => [[19,'experto',5,'Diseño','sí'],[20,'experto',4,'Diseño','sí'],[3,'intermedio',2,'Frontend','no'],[27,'experto',5,'Blandas','sí'],[22,'experto',5,'Blandas','sí'],[25,'avanzado',4,'Blandas','no'],[26,'avanzado',5,'Blandas','no']],
        4  => [[8,'experto',5,'Lenguajes','sí'],[10,'experto',4,'Bases de Datos','sí'],[17,'avanzado',3,'Cloud','sí'],[12,'intermedio',2,'Bases de Datos','no'],[14,'avanzado',5,'Herramientas','no'],[24,'experto',5,'Blandas','sí'],[25,'avanzado',4,'Blandas','no']],
        5  => [[3,'avanzado',4,'Frontend','sí'],[4,'avanzado',3,'Frontend','sí'],[5,'avanzado',3,'Frontend','sí'],[14,'avanzado',4,'Herramientas','no'],[15,'avanzado',4,'Backend','no'],[26,'experto',5,'Blandas','sí'],[23,'avanzado',4,'Blandas','no']],
        6  => [[13,'experto',5,'DevOps','sí'],[17,'experto',4,'Cloud','sí'],[18,'experto',6,'Sistemas','sí'],[14,'experto',6,'Herramientas','no'],[8,'intermedio',2,'Lenguajes','no'],[21,'avanzado',4,'Blandas','sí'],[24,'avanzado',5,'Blandas','no']],
        7  => [[6,'experto',4,'Frontend','sí'],[2,'experto',3,'Backend','sí'],[3,'avanzado',4,'Frontend','sí'],[10,'avanzado',3,'Bases de Datos','no'],[15,'avanzado',3,'Backend','no'],[14,'avanzado',4,'Herramientas','no'],[23,'experto',4,'Blandas','sí']],
        8  => [[3,'avanzado',4,'Frontend','sí'],[4,'intermedio',2,'Frontend','no'],[14,'experto',5,'Herramientas','sí'],[13,'intermedio',2,'DevOps','no'],[15,'avanzado',4,'Backend','no'],[24,'experto',5,'Blandas','sí'],[25,'avanzado',4,'Blandas','no'],[26,'avanzado',4,'Blandas','no']],
        9  => [[17,'experto',6,'Cloud','sí'],[13,'experto',5,'DevOps','sí'],[18,'experto',6,'Sistemas','sí'],[8,'avanzado',3,'Lenguajes','no'],[10,'avanzado',4,'Bases de Datos','no'],[15,'experto',5,'Backend','no'],[21,'avanzado',4,'Blandas','sí']],
        10 => [[3,'intermedio',3,'Frontend','no'],[2,'intermedio',2,'Backend','no'],[14,'avanzado',5,'Herramientas','no'],[21,'experto',5,'Blandas','sí'],[22,'experto',6,'Blandas','sí'],[23,'experto',5,'Blandas','sí'],[25,'experto',5,'Blandas','sí'],[26,'avanzado',5,'Blandas','no']],
    ];

    // ─── Educación: [institucion, titulo, area, grado, inicio, fin, desc] ────
    private array $educacion = [
        1  => [
            ['Universidad Mayor de San Simón','Licenciatura en Ingeniería de Sistemas','Desarrollo de Software','licenciado','2017-03-01','2021-12-15','Énfasis en interfaces gráficas y experiencia de usuario.'],
        ],
        2  => [
            ['Universidad Mayor de San Andrés','Licenciatura en Informática','Ingeniería de Software','licenciado','2016-02-01','2021-11-30','Tesis sobre optimización de consultas en bases de datos relacionales.'],
            ['Platzi','Escuela de Desarrollo Web','Backend con Node.js y Laravel','titulo_superior','2022-01-01','2022-06-30','Programa intensivo de 6 meses.'],
        ],
        3  => [
            ['Universidad Privada de Santa Cruz','Licenciatura en Diseño Gráfico','Diseño Digital','licenciado','2016-03-01','2020-12-10','Especialización en UX Research y diseño de interfaces.'],
            ['Interaction Design Foundation','UX Design Professional','Experiencia de Usuario','especialidad','2021-04-01','2022-01-31','Programa online de diseño centrado en el usuario.'],
        ],
        4  => [
            ['Universidad de Buenos Aires','Licenciatura en Ciencias de la Computación','Ciencias de Datos','licenciado','2015-03-01','2020-06-30','Tesis sobre modelos de regresión aplicados al sector financiero.'],
            ['Coursera / Johns Hopkins','Data Science Specialization','Machine Learning','especialidad','2021-01-01','2021-08-31','Especialización de 10 cursos en R, estadística y ML.'],
        ],
        5  => [
            ['Universidad Nacional de Colombia','Ingeniería de Sistemas','Desarrollo Móvil','licenciado','2016-02-01','2021-05-15','Proyecto de grado: app de salud con Flutter integrada con IA.'],
        ],
        6  => [
            ['Universidad Politécnica de Madrid','Grado en Ingeniería Informática','Sistemas e Infraestructura','titulo_superior','2014-09-01','2018-06-30','Especialidad en sistemas operativos, redes y computación en la nube.'],
            ['AWS Training','AWS Solutions Architect Learning Path','Cloud Computing','especialidad','2020-01-01','2020-06-30','Formación oficial para certificación AWS SAA.'],
        ],
        7  => [
            ['Universidad Técnica de Oruro','Licenciatura en Ingeniería de Sistemas','Desarrollo Web','licenciado','2017-02-01','2022-11-30','Tesis sobre aplicaciones web progresivas con Vue.js.'],
        ],
        8  => [
            ['Instituto Politécnico Nacional','Ingeniería en Sistemas Computacionales','Calidad de Software','licenciado','2016-08-01','2021-07-30','Especialización en metodologías ágiles y testing automatizado.'],
            ['ISQI / ISTQB','Certified Tester Foundation Level','Aseguramiento de Calidad','titulo_superior','2022-03-01','2022-04-15','Certificación internacional en testing de software.'],
        ],
        9  => [
            ['Pontificia Universidad Católica de Chile','Ingeniería Civil en Computación','Sistemas Distribuidos','titulo_superior','2014-03-01','2019-12-20','Tesis sobre arquitecturas serverless en entornos cloud.'],
            ['Google Cloud','Professional Cloud Architect Learning Path','Cloud Architecture','especialidad','2021-06-01','2021-10-30','Formación oficial para certificación GCP.'],
        ],
        10 => [
            ['Universidad ORT Uruguay','Licenciatura en Sistemas','Gestión de Proyectos TI','licenciado','2015-03-01','2019-11-30','Énfasis en metodologías ágiles y gestión de proyectos tecnológicos.'],
            ['Coursera / Michigan','Product Management Specialization','Product Management','especialidad','2021-09-01','2022-02-28','Especialización en roadmaps, métricas y estrategia de producto.'],
        ],
    ];

    // ─── Experiencia: [empresa_id, tipo, puesto, desc, inicio, fin, es_actual, ubicacion] ──
    private array $experiencia = [
        1  => [
            [1,'tiempo_completo','Frontend Developer','Desarrollo de interfaces con React y TypeScript. Implementación del sistema de diseño. Optimización de performance y métricas Core Web Vitals.','2022-03-01',null,true,'Cochabamba, Bolivia'],
            [7,'medio_tiempo','Instructora de React','Dictado de cursos de React para estudiantes universitarios. Elaboración de material didáctico y proyectos prácticos.','2021-06-01','2022-02-28',false,'Remoto'],
        ],
        2  => [
            [2,'tiempo_completo','Backend Developer Senior','Desarrollo de APIs RESTful con Laravel y Node.js. Diseño de esquemas en PostgreSQL. Implementación de autenticación OAuth2 y JWT.','2022-01-01',null,true,'La Paz, Bolivia'],
            [4,'freelance','Desarrollador Backend Freelance','Desarrollo de microservicios para startups latinoamericanas. Consultoría en arquitectura de APIs y bases de datos.','2020-06-01','2021-12-31',false,'Remoto'],
        ],
        3  => [
            [6,'tiempo_completo','UX/UI Designer Senior','Diseño de productos digitales para clientes globales. Liderazgo del proceso de UX Research: entrevistas, pruebas de usabilidad y análisis heurístico.','2021-08-01',null,true,'Santa Cruz, Bolivia'],
            [7,'medio_tiempo','Diseñadora UI','Diseño de interfaces para plataforma e-learning. Creación de sistema de diseño en Figma.','2020-09-01','2021-07-31',false,'Remoto'],
        ],
        4  => [
            [3,'tiempo_completo','Data Scientist Senior','Construcción de modelos predictivos con Python y scikit-learn. Diseño de pipelines ETL con Spark. Presentación de insights a stakeholders C-level.','2021-09-01',null,true,'Buenos Aires, Argentina'],
            [4,'freelance','Data Analyst Freelance','Análisis exploratorio de datos para empresas de retail. Dashboards en Power BI y Tableau.','2020-01-01','2021-08-31',false,'Remoto'],
        ],
        5  => [
            [5,'tiempo_completo','Mobile Developer','Desarrollo de apps Flutter para iOS y Android. Integración con APIs REST y Firebase. Publicación y mantenimiento en tiendas de aplicaciones.','2022-05-01',null,true,'Medellín, Colombia'],
            [4,'freelance','Desarrolladora Móvil Freelance','Desarrollo de apps React Native para clientes de Colombia y México. Integración con pasarelas de pago.','2021-03-01','2022-04-30',false,'Remoto'],
        ],
        6  => [
            [6,'tiempo_completo','DevOps Engineer Senior','Diseño de infraestructura AWS con Terraform. Gestión de clústeres Kubernetes en producción. Implementación de pipelines GitHub Actions.','2020-10-01',null,true,'Madrid, España'],
            [2,'tiempo_completo','Administrador de Sistemas','Administración de servidores Linux. Monitoreo con Prometheus y Grafana. Automatización con Ansible.','2018-07-01','2020-09-30',false,'Madrid, España'],
        ],
        7  => [
            [1,'tiempo_completo','Fullstack Developer','Desarrollo de funcionalidades con Vue.js y Laravel. Integración de APIs de terceros y pasarelas de pago. Participación en ceremonias ágiles.','2023-01-01',null,true,'Cochabamba, Bolivia'],
            [4,'freelance','Desarrolladora Freelance','Desarrollo de sitios web y tiendas en línea para PyMEs bolivianas.','2021-06-01','2022-12-31',false,'Remoto'],
        ],
        8  => [
            [2,'tiempo_completo','QA Engineer','Automatización de pruebas E2E con Cypress. Definición de estrategias de testing. Revisión de criterios de aceptación con el equipo de producto.','2022-02-01',null,true,'Ciudad de México, México'],
            [5,'tiempo_completo','QA Analyst','Testing manual y exploratorio para apps móviles. Gestión de bugs en Jira. Colaboración con desarrolladores para resolución de defectos.','2020-08-01','2022-01-31',false,'Remoto'],
        ],
        9  => [
            [6,'tiempo_completo','Cloud Architect','Diseño de arquitecturas cloud en AWS y GCP. Revisión de costos y optimización de recursos. Implementación de estrategias de disaster recovery.','2021-03-01',null,true,'Santiago, Chile'],
            [3,'tiempo_completo','Cloud Engineer','Migración de infraestructura on-premise a AWS. Implementación de soluciones serverless con Lambda y API Gateway.','2019-07-01','2021-02-28',false,'Santiago, Chile'],
        ],
        10 => [
            [5,'tiempo_completo','Product Manager','Definición y priorización del roadmap de producto. Trabajo con equipos de diseño y desarrollo en ciclos de 2 semanas. Análisis de métricas con Mixpanel.','2022-06-01',null,true,'Montevideo, Uruguay'],
            [4,'freelance','Product Consultant','Consultoría de producto para startups en etapa temprana. Definición de MVPs y estrategias de go-to-market.','2020-09-01','2022-05-31',false,'Remoto'],
        ],
    ];

    // ─── Certificaciones: [entidad_id, nombre, obtencion, expiracion, url] ───
    private array $certificaciones = [
        1  => [
            [1,'Meta Front-End Developer Professional Certificate','2022-08-01',null,'https://coursera.org/verify/demo001'],
            [3,'Google UX Design Professional Certificate','2023-03-10',null,'https://grow.google/cert/demo002'],
        ],
        2  => [
            [2,'Laravel: The Complete Developer Course','2021-05-15',null,'https://udemy.com/cert/demo003'],
            [7,'Back End Development and APIs – freeCodeCamp','2022-10-01',null,'https://freecodecamp.org/cert/demo004'],
        ],
        3  => [
            [9,'UX Foundations: Prototyping','2021-11-20',null,'https://linkedin.com/cert/demo005'],
            [3,'Google UX Design Professional Certificate','2022-06-15',null,'https://grow.google/cert/demo006'],
        ],
        4  => [
            [1,'IBM Data Science Professional Certificate','2021-10-01',null,'https://coursera.org/verify/demo007'],
            [5,'AWS Certified Data Analytics – Specialty','2023-01-20','2026-01-20','https://aws.amazon.com/cert/demo008'],
        ],
        5  => [
            [4,'Meta React Native Specialist','2022-09-01',null,'https://developers.facebook.com/cert/demo009'],
            [3,'Google Associate Android Developer','2023-02-12','2026-02-12','https://grow.google/cert/demo010'],
        ],
        6  => [
            [5,'AWS Certified Solutions Architect – Associate','2020-11-15','2023-11-15','https://aws.amazon.com/cert/demo011'],
            [5,'AWS Certified DevOps Engineer – Professional','2022-04-10','2025-04-10','https://aws.amazon.com/cert/demo012'],
            [6,'Microsoft Certified: Azure Administrator','2023-05-05','2025-05-05','https://learn.microsoft.com/cert/demo013'],
        ],
        7  => [
            [8,'Escuela de Vue.js – Platzi','2022-07-01',null,'https://platzi.com/cert/demo014'],
            [1,'Full-Stack Web Development with Vue & Laravel','2023-01-15',null,'https://coursera.org/verify/demo015'],
        ],
        8  => [
            [9,'ISTQB Certified Tester Foundation Level','2022-05-10',null,'https://linkedin.com/cert/demo016'],
            [2,'Cypress – Modern Automation Testing from Scratch','2022-11-20',null,'https://udemy.com/cert/demo017'],
        ],
        9  => [
            [5,'AWS Certified Solutions Architect – Professional','2021-08-20','2024-08-20','https://aws.amazon.com/cert/demo018'],
            [3,'Google Professional Cloud Architect','2022-02-14','2024-02-14','https://cloud.google.com/cert/demo019'],
            [6,'Microsoft Certified: Azure Solutions Architect','2023-06-10','2025-06-10','https://learn.microsoft.com/cert/demo020'],
        ],
        10 => [
            [9,'Product Management First Steps','2021-12-01',null,'https://linkedin.com/cert/demo021'],
            [1,'Product Management Specialization','2022-03-01',null,'https://coursera.org/verify/demo022'],
        ],
    ];

    // ─── Logros: [entidad_id|null, titulo, desc, fecha, url|null, id_ext|null] ─
    private array $logros = [
        1  => [
            [null,'2do lugar – Hackathon InnovaBolivia 2023','Segundo puesto en la categoría frontend construyendo un dashboard de gestión energética en tiempo real.','2023-09-10',null,null],
        ],
        2  => [
            [null,'Top Contributor – Laravel Bolivia Community','Reconocido entre los 5 colaboradores más activos de la comunidad Laravel Bolivia durante 2023.','2023-12-01',null,null],
            [null,'Speaker – DevFest Cochabamba 2024','Charla sobre "Clean Architecture en APIs Laravel" ante más de 150 asistentes.','2024-04-15','https://devfest.co/speakers/rodrigo',null],
        ],
        3  => [
            [null,'1er lugar – UX Challenge LATAM 2023','Primer lugar en el reto de rediseño de app bancaria para usuarios con discapacidad visual.','2023-07-20','https://uxlatam.com/resultados','UXCH2023-01'],
        ],
        4  => [
            [null,'Kaggle Competition – Top 3%','Clasificó en el top 3% en la competencia "Tabular Playground Series" con un modelo XGBoost optimizado.','2023-06-01','https://kaggle.com/competitions/tps',null],
            [null,'Ponente – PyCon Bolivia 2024','Presentación sobre "Feature Engineering para datos financieros con Pandas y Polars".','2024-05-10','https://pycon.bo/speakers',null],
        ],
        5  => [
            [null,'App Destacada – Google Play Store Colombia','La app HealthTrack fue destacada por Google Play en la categoría Salud & Bienestar durante septiembre 2023.','2023-09-01',null,null],
        ],
        6  => [
            [null,'Speaker – KubeCon Europe 2024','Presentación sobre "Cost Optimization in Production Kubernetes Clusters" ante más de 500 asistentes.','2024-03-20','https://kubecon.io/speakers/gabriel',null],
            [5,'AWS Community Builder 2023','Reconocimiento de AWS como Community Builder en la categoría Cloud Operations.','2023-07-01','https://aws.amazon.com/builder/gabriel','CB2023-456'],
        ],
        7  => [
            [null,'3er lugar – Hackathon TechBolivia 2023','Tercer puesto construyendo una plataforma de gestión de proyectos para PyMEs en 48 horas.','2023-11-05',null,null],
        ],
        8  => [
            [null,'ISTQB con puntuación más alta de la convocatoria','Aprobó el examen ISTQB Foundation Level con el puntaje más alto de su convocatoria en México.','2022-05-10',null,'ISTQB-MX-2022-001'],
        ],
        9  => [
            [5,'AWS Hero – Community Recognition','Reconocida por AWS como una de las referentes de la comunidad cloud en Latinoamérica.','2023-10-01','https://aws.amazon.com/hero/natalia','HERO-2023-CL'],
            [null,'Speaker – AWS re:Invent 2023','Presentación sobre estrategias de migración cloud para empresas de mediana escala.','2023-11-28','https://reinvent.awsevents.com/speakers',null],
        ],
        10 => [
            [null,'Product of the Year – StartupLab 2023','El producto liderado por Matías fue reconocido como el de mayor impacto en el portafolio de StartupLab.','2023-12-15',null,null],
        ],
    ];

    // ─── Idiomas: [idioma_id, nivel] ──────────────────────────────────────────
    private array $idiomas = [
        1  => [[1,'nativo'],[2,'b2']],
        2  => [[1,'nativo'],[2,'b1']],
        3  => [[1,'nativo'],[2,'b2'],[4,'a2']],
        4  => [[1,'nativo'],[2,'c1'],[3,'b1']],
        5  => [[1,'nativo'],[2,'b2']],
        6  => [[1,'nativo'],[2,'c2'],[5,'b1']],
        7  => [[1,'nativo'],[2,'b1']],
        8  => [[1,'nativo'],[2,'b2']],
        9  => [[1,'nativo'],[2,'c1']],
        10 => [[1,'nativo'],[2,'b2'],[3,'a2']],
    ];

    // ─── Proyectos: [titulo, desc, categoria_id, inicio, fin] ────────────────
    private array $proyectos = [
        1  => [
            ['Portfolio Personal v2','Rediseño del portafolio personal usando React, Framer Motion y Tailwind CSS. Incluye modo oscuro, animaciones y optimización SEO.',1,'2023-06-01','2023-08-15'],
            ['Dashboard Analytics UI','Dashboard de visualización de datos con React y Recharts. Gráficos interactivos, filtros por fecha y exportación a PDF.',1,'2023-09-01','2023-11-30'],
        ],
        2  => [
            ['API REST E-Commerce','API completa para tienda en línea con Laravel. Autenticación JWT, gestión de inventario, pagos con Stripe y notificaciones por email.',3,'2022-08-01','2022-11-30'],
            ['CLI Task Manager','Herramienta de línea de comandos para gestión de tareas con Node.js. Sincronización con Google Tasks y notificaciones en terminal.',8,'2023-02-01','2023-04-30'],
        ],
        3  => [
            ['App Bancaria – Rediseño UX','Rediseño completo de la experiencia de usuario de una app bancaria. Investigación, wireframes, prototipo en Figma y pruebas con 20 usuarios.',6,'2023-01-15','2023-05-30'],
            ['Design System Bolt','Sistema de diseño para equipos pequeños: 80+ componentes en Figma con variantes, tokens de diseño y guía de uso.',6,'2023-07-01','2023-10-31'],
        ],
        4  => [
            ['Predictor de Precios Inmobiliarios','Modelo de ML para predecir precios de propiedades en Buenos Aires. Usa XGBoost con feature engineering sobre datos del mercado.',4,'2022-10-01','2023-01-31'],
            ['Pipeline ETL de Datos Financieros','Pipeline de ingesta y transformación con Apache Spark y AWS Glue. Reduce tiempos de procesamiento en un 70%.',4,'2023-03-01','2023-07-31'],
        ],
        5  => [
            ['HealthTrack – App de Salud','App móvil para seguimiento de hábitos saludables con Flutter. Integración con HealthKit/Google Fit, gráficos de progreso y recordatorios.',2,'2022-09-01','2023-02-28'],
            ['Mercado Local – App de Delivery','App de delivery para mercados locales con React Native. Pagos con MercadoPago y tracking en tiempo real con Google Maps.',2,'2023-04-01','2023-09-30'],
        ],
        6  => [
            ['Infra as Code – AWS con Terraform','Módulos Terraform para desplegar infraestructura AWS completa (VPC, EKS, RDS, S3). Reutilizable y documentado con Terragrunt.',5,'2022-11-01','2023-02-28'],
            ['Plataforma CI/CD Multi-Equipo','Plataforma de CI/CD con GitHub Actions y ArgoCD para gestionar deployments de 15 microservicios con rollback automático.',5,'2023-05-01','2023-10-31'],
        ],
        7  => [
            ['Sistema de Gestión PyMEs','App web para gestión de inventario, ventas y reportes para pequeñas empresas. Construida con Vue.js, Laravel y PostgreSQL.',1,'2023-02-01','2023-07-31'],
            ['Blog Técnico con Nuxt.js','Blog de contenido técnico con Nuxt.js y Markdown. Generación estática, modo oscuro, búsqueda en tiempo real y RSS.',1,'2023-09-01','2023-11-30'],
        ],
        8  => [
            ['Framework de Testing E2E','Framework de automatización de pruebas con Cypress y TypeScript. Incluye fixtures, comandos personalizados y reportes con Allure.',7,'2022-12-01','2023-03-31'],
            ['QA Toolkit – CLI','Herramienta CLI para QA engineers: genera reportes, ejecuta suites de pruebas y notifica resultados a Slack.',8,'2023-06-01','2023-08-31'],
        ],
        9  => [
            ['Arquitectura Serverless – AWS Lambda','Diseño e implementación de arquitectura serverless para procesamiento de eventos con AWS Lambda, SQS y DynamoDB.',5,'2022-07-01','2022-12-31'],
            ['Multi-Cloud Cost Monitor','Herramienta open source para monitorear y optimizar costos en AWS, GCP y Azure desde un único dashboard.',7,'2023-04-01','2023-09-30'],
        ],
        10 => [
            ['ProductOS – Gestión de Roadmap','Herramienta web para gestión de roadmaps con priorización por impacto/esfuerzo, integración con Jira y reportes automáticos.',1,'2023-01-01','2023-06-30'],
            ['Framework de Métricas de Producto','Template open source para definir y trackear métricas clave de producto (AARRR, North Star) con dashboard en Notion y Sheets.',7,'2023-08-01','2023-11-30'],
        ],
    ];

    // ─── run() ────────────────────────────────────────────────────────────────

    public function run(): void
    {
        foreach ($this->usuarios as $idx => $u) {

            // 1. Usuario
            $userId = DB::table('usuario')->insertGetId([
                'correo'         => $u['correo'],
                'nombre_usuario' => $u['username'],
                'contrasenia'    => Hash::make('Password123!'),
                'rol'            => 'developer',
                'eliminado'      => false,
                'creado_en'      => now()->subMonths(12 - $idx),
            ], 'id_usuario');

            // 2. Perfil
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
            ]);

            // 3. Configuración de privacidad
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

            // 4. Publicación
            DB::table('portafolio_publicacion')->insert([
                'usuario_id'      => $userId,
                'slug_publico'    => str_replace('_', '-', $u['username']),
                'publicado'       => true,
                'publicado_en'    => now()->subDays(rand(5, 60)),
                'despublicado_en' => null,
                'creado_en'       => now(),
                'actualizado_en'  => now(),
            ]);

            // 5. Habilidades
            foreach ($this->habilidades[$idx] as [$hid, $nivel, $anos, $cat, $dest]) {
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

            // 6. Educación
            foreach ($this->educacion[$idx] as $e) {
                DB::table('educacion')->insert([
                    'usuario_id'   => $userId,
                    'institucion'  => $e[0],
                    'titulo'       => $e[1],
                    'area_estudio' => $e[2],
                    'grado'        => $e[3],
                    'fecha_inicio' => $e[4],
                    'fecha_fin'    => $e[5],
                    'descripcion'  => $e[6],
                    'visibilidad'  => 'publico',
                    'eliminado'    => false,
                ]);
            }

            // 7. Experiencia
            foreach ($this->experiencia[$idx] as $exp) {
                DB::table('experiencia')->insert([
                    'usuario_id'   => $userId,
                    'empresa_id'   => $exp[0],
                    'tipo'         => $exp[1],
                    'puesto'       => $exp[2],
                    'descripcion'  => $exp[3],
                    'fecha_inicio' => $exp[4],
                    'fecha_fin'    => $exp[5],
                    'es_actual'    => $exp[6],
                    'ubicacion'    => $exp[7],
                    'visibilidad'  => 'publico',
                    'eliminado'    => false,
                ]);
            }

            // 8. Certificaciones
            foreach ($this->certificaciones[$idx] as $c) {
                DB::table('certificacion')->insert([
                    'usuario_id'         => $userId,
                    'entidad_emisora_id' => $c[0],
                    'nombre'             => $c[1],
                    'fecha_obtencion'    => $c[2],
                    'fecha_expiracion'   => $c[3],
                    'url_certificado'    => $c[4],
                    'visibilidad'        => 'publico',
                    'eliminado'          => false,
                ]);
            }

            // 9. Logros
            foreach ($this->logros[$idx] as $l) {
                DB::table('logro')->insert([
                    'usuario_id'         => $userId,
                    'entidad_emisora_id' => $l[0],
                    'titulo'             => $l[1],
                    'descripcion'        => $l[2],
                    'fecha_obtencion'    => $l[3],
                    'url_credencial'     => $l[4],
                    'identificador'      => $l[5],
                    'visibilidad'        => 'publico',
                    'eliminado'          => false,
                ]);
            }

            // 10. Idiomas
            foreach ($this->idiomas[$idx] as [$idiomaId, $nivel]) {
                DB::table('usuario_idioma')->insert([
                    'usuario_id'  => $userId,
                    'idioma_id'   => $idiomaId,
                    'nivel'       => $nivel,
                    'visibilidad' => 'publico',
                    'eliminado'   => false,
                ]);
            }

            // 11. Proyectos
            foreach ($this->proyectos[$idx] as $orden => $p) {
                $slug = strtolower(str_replace([' ', '–', '/'], ['-', '-', '-'], $p[0]));
                $proyectoId = DB::table('proyecto')->insertGetId([
                    'usuario_id'      => $userId,
                    'categoria_id'    => $p[2],
                    'titulo'          => $p[0],
                    'descripcion'     => $p[1],
                    'fecha_inicio'    => $p[3],
                    'fecha_fin'       => $p[4],
                    'repositorio_url' => "https://github.com/{$u['username']}/{$slug}",
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
        }
    }
}