export interface Perfil {
  id_perfil: number;
  nombre_perfil: string;
  apellido_perfil: string;
  profesion: string;
  celular: string;
  descripcion: string;
  foto_url: string | null;
  ciudad?: string | null;
  pais?: string | null;
  correo_contacto?: string | null;
  enlaces_personalizados?: PerfilEnlace[];
  enlacesPersonalizados?: PerfilEnlace[];
}

export interface PerfilEnlace {
  id_perfil_enlace?: number;
  titulo: string;
  url: string;
  orden?: number;
}

export interface HabilidadItem {
  id_usuario_habilidad: number;
  nombre: string;
  nivel: string | null;
}

export interface HabilidadCatalogo {
  id_habilidad: number;
  nombre: string;
  tipo: "tecnica" | "blanda";
}

export interface Proyecto {
  id_proyecto: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  demo_url: string | null;
  repositorio_url: string | null;
  imagen_principal_url: string | null;
  estado: "en_progreso" | "finalizado" | "pausado";
  roles: string[];
}

export interface Curso {
  id_educacion: number;
  institucion: string;
  titulo: string;
  area_estudio: "curso";
  rol_curso: RolCurso | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  descripcion: string | null;
  visibilidad: "publico" | "privado";
}

export interface Logro {
  id_logro: number;
  titulo: string;
  descripcion: string | null;
  fecha_obtencion: string | null;
  entidad_nombre?: string | null;
  url_credencial?: string | null;
  identificador?: string | null;
  visibilidad: "publico" | "privado";
}


export type GradoEducacion =
  | "titulo_bachiller"
  | "tecnico_medio"
  | "titulo_superior"
  | "licenciado"
  | "especialidad"
  | "maestria"
  | "doctorado"
  | "post_doctorado"
  | "otro";


export const GRADO_LABELS: Record<GradoEducacion, string> = {
  titulo_bachiller: "Título de Bachiller",
  tecnico_medio:    "Técnico Medio",
  titulo_superior:  "Título Superior",
  licenciado:       "Licenciado/a",
  especialidad:     "Especialidad",
  maestria:         "Maestría",
  doctorado:        "Doctorado",
  post_doctorado:   "Post Doctorado",
  otro:            "Otro",
};



export interface Educacion {
  id_educacion: number;
  institucion: string;
  titulo: string;
  area_estudio: string | null;
  grado: GradoEducacion | null;   // HU-8: null en registros históricos sin grado asignado
  fecha_inicio: string;
  fecha_fin: string | null;
  descripcion: string | null;
  visibilidad: "publico" | "privado";
}

export type RolCurso =
  | "estudiante"
  | "auxiliar"
  | "docente"
  | "profesor"
  | "no_aplica";

export const ROL_CURSO_LABELS: Record<RolCurso, string> = {
  estudiante: "Estudiante",
  auxiliar:   "Auxiliar",
  docente:    "Docente",
  profesor:   "Profesor",
  no_aplica:  "No aplica",
};


export interface Idioma {
  id_usuario_idioma: number;
  nombre: string;
  nivel: "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | "nativo";
  visibilidad: "publico" | "privado";
}

export interface Certificacion {
  id_certificacion: number;
  nombre: string;
  nombre_entidad: string;
  entidadEmisora?: {
    nombre?: string | null;
  } | null;
  fecha_obtencion: string;
  fecha_expiracion: string | null;
  url_certificado: string | null;
  imagen_url: string | null;
  visibilidad: "publico" | "privado";
}

export interface Experiencia {
  id_experiencia: number;
  nombre_empresa: string;
  puesto: string;
  tipo?: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  es_actual?: boolean;
  ubicacion?: string | null;
  visibilidad?: "publico" | "privado";
}

export interface PortafolioData {
  perfil: Perfil | null;
  contacto_directo?: ContactoDirecto;
  habilidades_tecnicas: HabilidadItem[];
  habilidades_blandas: HabilidadItem[];
  proyectos: Proyecto[];
  educaciones: Educacion[];
  cursos: Curso[];
  logros: Logro[];
  idiomas: Idioma[];
  certificaciones: Certificacion[];
  experiencias?: Experiencia[];
  configuracion?: ConfiguracionSecciones;
}

export interface ContactoDirecto {
  habilitado: boolean;
  correo: string | null;
}

export interface EstadoPublicacionPortafolio {
  publicado: boolean;
  enlace_activo: boolean;
  slug_publico: string | null;
  url_publica: string | null;
  api_url_publica?: string | null;
  visualizaciones: number;
  publicado_en: string | null;
  despublicado_en: string | null;
}

export interface PortafolioPublicoResumen {
  id_publicacion: number;
  slug_publico: string;
  url_publica: string;
  nombre: string;
  profesion: string | null;
  descripcion: string | null;
  foto_url: string | null;
  perfil_privado: boolean;
  publicado_en: string | null;
}

export interface PortafolioGuardadoResumen extends PortafolioPublicoResumen {
  id_guardado: number;
  disponible: boolean;
  guardado_en: string | null;
}

export interface EstadoGuardadoPortafolio {
  guardado: boolean;
}

export type EstadoVisibilidad = 'publico' | 'privado';

export interface ConfiguracionSecciones {
  mostrar_correo:          boolean;
  seccion_perfil:          EstadoVisibilidad;
  seccion_habilidades:     EstadoVisibilidad;
  seccion_proyectos:       EstadoVisibilidad;
  seccion_educacion:       EstadoVisibilidad;
  seccion_experiencia:     EstadoVisibilidad;
  seccion_cursos:          EstadoVisibilidad;
  seccion_certificaciones: EstadoVisibilidad;
  seccion_logros:          EstadoVisibilidad;
  seccion_idiomas:         EstadoVisibilidad;
}

export const SECCION_LABELS: Record<keyof ConfiguracionSecciones, string> = {
  mostrar_correo:          'Contacto directo',
  seccion_perfil:          'Perfil profesional',
  seccion_habilidades:     'Habilidades',
  seccion_proyectos:       'Proyectos',
  seccion_educacion:       'Formación académica',
  seccion_experiencia:     'Experiencia laboral',
  seccion_cursos:          'Cursos',
  seccion_certificaciones: 'Certificaciones',
  seccion_logros:          'Logros y reconocimientos',
  seccion_idiomas:         'Idiomas',
};
