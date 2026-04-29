import apiClient from "../lib/apiClient";

// El token Bearer es inyectado automáticamente en todas las llamadas
// por el interceptor configurado en apiClient.ts

export const getPortafolio = async () => {
  const res = await apiClient.get("/portafolio");
  return res.data;
};

export const updatePerfil = async (data: {
  nombre_perfil?: string;
  apellido_perfil?: string;
  profesion?: string;
  celular?: string;
  descripcion?: string;
  foto_url?: string;
}) => {
  const res = await apiClient.put("/portafolio/perfil", data);
  return res.data;
};

// ── Habilidades ───────────────────────────────────────────────────────────────
export const getCatalogoHabilidades = async () => {
  const res = await apiClient.get("/catalogo/habilidades");
  return res.data;
};

export const addHabilidad = async (data: {
  habilidad_id: number;
  nivel?: string;
}) => {
  const res = await apiClient.post("/portafolio/habilidades", data);
  return res.data;
};

export const updateHabilidad = async (id: number, data: { nivel: string }) => {
  const res = await apiClient.put(`/habilidades/${id}`, data);
  return res.data;
};

export const removeHabilidad = async (id: number) => {
  const res = await apiClient.delete(`/portafolio/habilidades/${id}`);
  return res.data;
};

// ── Proyectos ─────────────────────────────────────────────────────────────────
export const addProyecto = async (data: {
  titulo: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  demo_url?: string;
  repositorio_url?: string;
  roles?: string[];
}) => {
  const res = await apiClient.post("/portafolio/proyectos", data);
  return res.data;
};

export const updateProyecto = async (
  id: number,
  data: {
    titulo?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    demo_url?: string;
    repositorio_url?: string;
    roles?: string[];
  }
) => {
  const res = await apiClient.put(`/portafolio/proyectos/${id}`, data);
  return res.data;
};

export const removeProyecto = async (id: number) => {
  const res = await apiClient.delete(`/portafolio/proyectos/${id}`);
  return res.data;
};

// ── Cursos ────────────────────────────────────────────────────────────────────
export const addCurso = async (data: {
  nombre_curso: string;
  institucion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  es_actual?: boolean;
  descripcion?: string;
  visibilidad?: "publico" | "privado";
}) => {
  const res = await apiClient.post("/cursos", data);
  return res.data;
};

export const removeCurso = async (id: number) => {
  const res = await apiClient.delete(`/cursos/${id}`);
  return res.data;
};

export const getSugerenciasCurso = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await apiClient.get("/cursos/sugerencias", { params: { q } });
  return res.data.sugerencias ?? [];
};

// ── Educación ─────────────────────────────────────────────────────────────────
export const getEducaciones = async () => {
  const res = await apiClient.get("/educacion");
  return res.data;
};

export const getSugerenciasInstitucion = async (
  q: string
): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await apiClient.get("/educacion/sugerencias", { params: { q } });
  return res.data.sugerencias ?? [];
};

export const addEducacion = async (data: {
  institucion: string;
  titulo: string;
  area_estudio?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  descripcion?: string;
  visibilidad?: "publico" | "privado";
}) => {
  const res = await apiClient.post("/educacion", data);
  return res.data;
};

export const removeEducacion = async (id: number) => {
  const res = await apiClient.delete(`/educacion/${id}`);
  return res.data;
};

// ── Logros ────────────────────────────────────────────────────────────────────
// NOTA: getCatalogoEntidades fue eliminada — el endpoint backend no existía.
// Para sugerencias de entidad emisora usa getSugerenciasEntidad() que llama
// a GET /logros/sugerencias, el cual sí está implementado.

export const getLogros = async () => {
  const res = await apiClient.get("/logros");
  return res.data;
};

export const addLogro = async (data: {
  titulo: string;
  nombre_entidad: string;
  fecha_obtencion?: string;
  identificador?: string;
  descripcion?: string;
  visibilidad?: "publico" | "privado";
}) => {
  const res = await apiClient.post("/logros", data);
  return res.data;
};

export const removeLogro = async (id: number) => {
  const res = await apiClient.delete(`/logros/${id}`);
  return res.data;
};

// ── Experiencia ───────────────────────────────────────────────────────────────
type ExperienciaPayload = {
  nombre_empresa: string;
  puesto: string;
  tipo?: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  es_actual?: boolean;
  ubicacion?: string | null;
  visibilidad?: string;
};

export const addExperiencia = async (data: ExperienciaPayload) => {
  const res = await apiClient.post("/experiencias", data);
  return res.data;
};

export const getExperiencias = async () => {
  const res = await apiClient.get("/experiencias");
  return res.data.experiencias;
};

export const getExperiencia = async (id: number) => {
  const res = await apiClient.get(`/experiencias/${id}`);
  return res.data.experiencia;
};

export const updateExperiencia = async (id: number, data: ExperienciaPayload) => {
  const res = await apiClient.put(`/experiencias/${id}`, data);
  return res.data;
};

export const removeExperiencia = async (id: number) => {
  const res = await apiClient.delete(`/experiencias/${id}`);
  return res.data;
};

// ── Idiomas ───────────────────────────────────────────────────────────────────
export const addIdioma = async (data: {
  nombre_idioma: string;
  nivel: string;
  visibilidad?: "publico" | "privado";
}) => {
  const res = await apiClient.post("/idiomas", data);
  return res.data;
};

export const removeIdioma = async (id: number) => {
  const res = await apiClient.delete(`/idiomas/${id}`);
  return res.data;
};

// ── Certificaciones ───────────────────────────────────────────────────────────
export const getCertificaciones = async () => {
  const res = await apiClient.get("/certificaciones");
  return res.data.certificaciones;
};

export const addCertificacion = async (data: {
  nombre: string;
  nombre_entidad: string;
  fecha_obtencion: string;
  fecha_expiracion?: string;
  url_certificado?: string;
  visibilidad?: "publico" | "privado";
}) => {
  const res = await apiClient.post("/certificaciones", data);
  return res.data;
};

export const removeCertificacion = async (id: number) => {
  const res = await apiClient.delete(`/certificaciones/${id}`);
  return res.data;
};

// ── Sugerencias ───────────────────────────────────────────────────────────────
export const getSugerenciasEntidadEmisora = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await apiClient.get("/certificaciones/sugerencias", { params: { q } });
  return res.data.sugerencias ?? [];
};

export const getSugerenciasEmpresa = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await apiClient.get("/experiencias/sugerencias", { params: { q } });
  return res.data.sugerencias ?? [];
};

export const getSugerenciasEntidad = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await apiClient.get("/logros/sugerencias", { params: { q } });
  return res.data.sugerencias ?? [];
};

export const getSugerenciasIdioma = async (q: string): Promise<string[]> => {
  if (q.trim().length < 2) return [];
  const res = await apiClient.get("/idiomas/sugerencias", { params: { q } });
  return res.data.sugerencias ?? [];
};

export const getSugerenciasProfecion = async (q: string): Promise<string[]> => {
  if (q.trim().length < 2) return [];
  const res = await apiClient.get("/perfil/sugerencias-profesion", { params: { q } });
  return res.data.sugerencias ?? [];
};