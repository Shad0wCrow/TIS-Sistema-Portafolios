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

export interface PortafolioData {
  perfil: Perfil | null;
  habilidades_tecnicas: HabilidadItem[];
  habilidades_blandas: HabilidadItem[];
  proyectos: Proyecto[];
}

export interface Experiencia {
  id_experiencia: number;
  nombre_empresa: string;
  puesto: string;
  tipo?: string | null;
  descripcion?: string | null;
  fecha_inicio: string;       
  fecha_fin?: string | null;
  es_actual?: boolean;
  ubicacion?: string | null;
  visibilidad?: "publico" | "privado";
}