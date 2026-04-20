export interface Perfil {
  id_perfil: number;
  nombre_perfil: string;
  apellido_perfil: string;
  profesion: string;
  celular: string;
  descripcion: string;
  foto_url: string | null;
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
  titulo: string;        // almacena nombre_curso
  area_estudio: "curso";
  fecha_inicio: string;
  fecha_fin: string | null;
  descripcion: string | null;
  visibilidad: "publico" | "privado";
}
export interface Logro{
  id_logro: number;
  titulo: string;
  descripcion: string | null;
  fecha_obtencion: string | null;
  entidad_nombre?: string | null; 
  url_credencial?: string | null;
  identificador?: string | null;
  visibilidad: "publico" | "privado";
}

export interface PortafolioData {
  perfil: Perfil | null;
  habilidades_tecnicas: HabilidadItem[];
  habilidades_blandas: HabilidadItem[];
  proyectos: Proyecto[];
  educaciones: Educacion[];
  cursos: Curso[];
  logros: Logro[];
}
export interface Educacion {
  id_educacion: number;
  institucion: string;
  titulo: string;
  area_estudio: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  descripcion: string | null;
  visibilidad: "publico" | "privado";
}