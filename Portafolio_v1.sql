CREATE TYPE "estado_visibilidad" AS ENUM (
  'publico',
  'privado'
);

CREATE TYPE "nivel_habilidad" AS ENUM (
  'basico',
  'intermedio',
  'avanzado',
  'experto'
);

CREATE TYPE "tipo_habilidad" AS ENUM (
  'tecnica',
  'blanda'
);

CREATE TYPE "estado_proyecto" AS ENUM (
  'en_progreso',
  'finalizado',
  'pausado'
);

CREATE TYPE "nivel_idioma" AS ENUM (
  'a1',
  'a2',
  'b1',
  'b2',
  'c1',
  'c2',
  'nativo'
);

CREATE TYPE "tipo_reporte_enum" AS ENUM (
  'portafolio',
  'habilidades',
  'proyectos',
  'experiencia',
  'educacion',
  'certificaciones',
  'logros'
);

CREATE TABLE "pais" (
  "id_pais" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "iso" VARCHAR(10)
);

CREATE TABLE "region" (
  "id_region" SERIAL PRIMARY KEY,
  "pais_id" INT NOT NULL,
  "nombre" VARCHAR(100) NOT NULL
);

CREATE TABLE "usuario" (
  "id_usuario" SERIAL PRIMARY KEY,
  "correo" VARCHAR(255) UNIQUE NOT NULL,
  "nombre_usuario" VARCHAR(100) UNIQUE NOT NULL,
  "contrasenia" VARCHAR(255) NOT NULL,
  "rol" VARCHAR(50),
  "region_id" INT,
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "perfil" (
  "id_perfil" SERIAL PRIMARY KEY,
  "usuario_id" INT UNIQUE NOT NULL,
  "nombre_perfil" VARCHAR(255),
  "profesion" VARCHAR(150),
  "descripcion" TEXT,
  "foto_url" VARCHAR(500),
  "banner_url" VARCHAR(500),
  "correo_contacto" VARCHAR(255),
  "linkedin_url" VARCHAR(255),
  "visibilidad" estado_visibilidad DEFAULT 'privado',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "configuracion_privacidad" (
  "id_configuracion" SERIAL PRIMARY KEY,
  "usuario_id" INT UNIQUE NOT NULL,
  "mostrar_correo" BOOLEAN DEFAULT false,
  "mostrar_ubicacion" BOOLEAN DEFAULT false,
  "visibilidad_proyectos_por_defecto" estado_visibilidad DEFAULT 'privado',
  "visibilidad_habilidades_por_defecto" estado_visibilidad DEFAULT 'privado',
  "visibilidad_experiencias_por_defecto" estado_visibilidad DEFAULT 'privado',
  "visibilidad_logros_por_defecto" estado_visibilidad DEFAULT 'privado',
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "empresa" (
  "id_empresa" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(150) NOT NULL,
  "descripcion" TEXT,
  "sitio_web" VARCHAR(255)
);

CREATE TABLE "experiencia" (
  "id_experiencia" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "empresa_id" INT,
  "tipo" VARCHAR(50),
  "puesto" VARCHAR(150),
  "descripcion" TEXT,
  "fecha_inicio" DATE,
  "fecha_fin" DATE,
  "es_actual" BOOLEAN DEFAULT false,
  "ubicacion" VARCHAR(150),
  "visibilidad" estado_visibilidad DEFAULT 'privado',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "educacion" (
  "id_educacion" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "institucion" VARCHAR(150),
  "titulo" VARCHAR(150),
  "area_estudio" VARCHAR(150),
  "fecha_inicio" DATE,
  "fecha_fin" DATE,
  "descripcion" TEXT,
  "visibilidad" estado_visibilidad DEFAULT 'privado',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "entidad_emisora" (
  "id_entidad_emisora" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(150) NOT NULL,
  "sitio_web" VARCHAR(255),
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "certificacion" (
  "id_certificacion" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "entidad_emisora_id" INT,
  "nombre" VARCHAR(150) NOT NULL,
  "fecha_obtencion" DATE,
  "fecha_expiracion" DATE,
  "url_certificado" VARCHAR(500),
  "visibilidad" estado_visibilidad DEFAULT 'publico',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "logro" (
  "id_logro" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "entidad_emisora_id" INT,
  "titulo" VARCHAR(150) NOT NULL,
  "descripcion" TEXT,
  "fecha_obtencion" DATE,
  "url_credencial" VARCHAR(500),
  "identificador" VARCHAR(150),
  "visibilidad" estado_visibilidad DEFAULT 'publico',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "habilidad" (
  "id_habilidad" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) UNIQUE NOT NULL,
  "tipo" tipo_habilidad,
  "descripcion" TEXT,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "usuario_habilidad" (
  "id_usuario_habilidad" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "habilidad_id" INT NOT NULL,
  "nivel" nivel_habilidad,
  "anos_experiencia" INT,
  "categoria" VARCHAR(50),
  "destacado" varchar(100),
  "visibilidad" estado_visibilidad DEFAULT 'privado',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "idioma" (
  "id_idioma" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE "usuario_idioma" (
  "id_usuario_idioma" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "idioma_id" INT NOT NULL,
  "nivel" nivel_idioma NOT NULL,
  "visibilidad" estado_visibilidad DEFAULT 'publico',
  "eliminado" BOOLEAN DEFAULT false
);

CREATE TABLE "categoria_proyecto" (
  "id_categoria" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL,
  "descripcion" TEXT
);

CREATE TABLE "proyecto" (
  "id_proyecto" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "categoria_id" INT,
  "titulo" VARCHAR(255) NOT NULL,
  "descripcion" TEXT,
  "fecha_inicio" DATE,
  "fecha_fin" DATE,
  "estado" estado_proyecto DEFAULT 'en_progreso',
  "repositorio_url" VARCHAR(500),
  "demo_url" VARCHAR(500),
  "imagen_principal_url" VARCHAR(500),
  "visibilidad" estado_visibilidad DEFAULT 'publico',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "proyecto_usuario" (
  "id_proyecto_usuario" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "proyecto_id" INT NOT NULL,
  "rol_proyecto" VARCHAR(50),
  "es_propietario" BOOLEAN DEFAULT false,
  "fecha_union" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "tecnologia" (
  "id_tecnologia" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(100) UNIQUE NOT NULL,
  "tipo" VARCHAR(50),
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "proyecto_tecnologia" (
  "proyecto_id" INT NOT NULL,
  "tecnologia_id" INT NOT NULL,
  PRIMARY KEY ("proyecto_id", "tecnologia_id")
);

CREATE TABLE "proyecto_habilidad" (
  "proyecto_id" INT NOT NULL,
  "habilidad_id" INT NOT NULL,
  PRIMARY KEY ("proyecto_id", "habilidad_id")
);

CREATE TABLE "evidencia" (
  "id_evidencia" SERIAL PRIMARY KEY,
  "proyecto_id" INT NOT NULL,
  "titulo" VARCHAR(150),
  "descripcion" TEXT,
  "tipo_archivo" VARCHAR(50),
  "url_archivo" VARCHAR(500),
  "fecha_subida" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "eliminado" BOOLEAN DEFAULT false
);

CREATE TABLE "tag" (
  "id_tag" SERIAL PRIMARY KEY,
  "nombre" VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "proyecto_tag" (
  "proyecto_id" INT NOT NULL,
  "tag_id" INT NOT NULL,
  PRIMARY KEY ("proyecto_id", "tag_id")
);

CREATE TABLE "enlace_personalizado" (
  "id_enlace" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "titulo" VARCHAR(100),
  "url" VARCHAR(500),
  "nombre_icono" VARCHAR(50),
  "orden" SMALLINT,
  "visibilidad" estado_visibilidad DEFAULT 'publico',
  "eliminado" BOOLEAN DEFAULT false,
  "creado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "actualizado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "reporte" (
  "id_reporte" SERIAL PRIMARY KEY,
  "usuario_id" INT NOT NULL,
  "tipo_reporte" tipo_reporte_enum,
  "datos_reporte" JSON,
  "generado_en" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE UNIQUE INDEX ON "usuario_habilidad" ("usuario_id", "habilidad_id");

CREATE UNIQUE INDEX ON "usuario_idioma" ("usuario_id", "idioma_id");

ALTER TABLE "region" ADD FOREIGN KEY ("pais_id") REFERENCES "pais" ("id_pais") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuario" ADD FOREIGN KEY ("region_id") REFERENCES "region" ("id_region") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "perfil" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "configuracion_privacidad" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "experiencia" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "experiencia" ADD FOREIGN KEY ("empresa_id") REFERENCES "empresa" ("id_empresa") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "educacion" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "certificacion" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "certificacion" ADD FOREIGN KEY ("entidad_emisora_id") REFERENCES "entidad_emisora" ("id_entidad_emisora") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "logro" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "logro" ADD FOREIGN KEY ("entidad_emisora_id") REFERENCES "entidad_emisora" ("id_entidad_emisora") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuario_habilidad" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuario_habilidad" ADD FOREIGN KEY ("habilidad_id") REFERENCES "habilidad" ("id_habilidad") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuario_idioma" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "usuario_idioma" ADD FOREIGN KEY ("idioma_id") REFERENCES "idioma" ("id_idioma") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto" ADD FOREIGN KEY ("categoria_id") REFERENCES "categoria_proyecto" ("id_categoria") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_usuario" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_usuario" ADD FOREIGN KEY ("proyecto_id") REFERENCES "proyecto" ("id_proyecto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_tecnologia" ADD FOREIGN KEY ("proyecto_id") REFERENCES "proyecto" ("id_proyecto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_tecnologia" ADD FOREIGN KEY ("tecnologia_id") REFERENCES "tecnologia" ("id_tecnologia") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_habilidad" ADD FOREIGN KEY ("proyecto_id") REFERENCES "proyecto" ("id_proyecto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_habilidad" ADD FOREIGN KEY ("habilidad_id") REFERENCES "habilidad" ("id_habilidad") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "evidencia" ADD FOREIGN KEY ("proyecto_id") REFERENCES "proyecto" ("id_proyecto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_tag" ADD FOREIGN KEY ("proyecto_id") REFERENCES "proyecto" ("id_proyecto") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "proyecto_tag" ADD FOREIGN KEY ("tag_id") REFERENCES "tag" ("id_tag") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "enlace_personalizado" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reporte" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuario" ("id_usuario") DEFERRABLE INITIALLY IMMEDIATE;
