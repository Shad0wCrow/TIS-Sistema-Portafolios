import axios from "axios";

const API = "http://localhost:8000/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getPortafolio = async () => {
  const res = await axios.get(`${API}/portafolio`, { headers: authHeaders() });
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
  const isDataUrl = data.foto_url?.startsWith("data:image/");

  if (isDataUrl) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (data.nombre_perfil !== undefined) formData.append("nombre_perfil", data.nombre_perfil);
    if (data.apellido_perfil !== undefined) formData.append("apellido_perfil", data.apellido_perfil);
    if (data.profesion !== undefined) formData.append("profesion", data.profesion);
    if (data.celular !== undefined) formData.append("celular", data.celular);
    if (data.descripcion !== undefined) formData.append("descripcion", data.descripcion);

    const blob = dataUrlToBlob(data.foto_url!);
    const ext = blob.type.split("/")[1] ?? "jpg";
    formData.append("foto_file", blob, `foto.${ext}`);

    const res = await axios.post(`${API}/portafolio/perfil`, formData, {
      headers: { ...authHeaders() },
    });
    return res.data;
  }

  const res = await axios.put(`${API}/portafolio/perfil`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

// ── Habilidades ───────────────────────────────────────────────────────────────
export const getCatalogoHabilidades = async () => {
  const res = await axios.get(`${API}/catalogo/habilidades`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const addHabilidad = async (data: {
  habilidad_id: number;
  nivel?: string;
}) => {
  const res = await axios.post(`${API}/portafolio/habilidades`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const updateHabilidad = async (id: number, data: { nivel: string }) => {
  const res = await axios.put(`${API}/habilidades/${id}`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const removeHabilidad = async (id: number) => {
  const res = await axios.delete(`${API}/portafolio/habilidades/${id}`, {
    headers: authHeaders(),
  });
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
  const res = await axios.post(`${API}/portafolio/proyectos`, data, {
    headers: authHeaders(),
  });
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
  const res = await axios.put(`${API}/portafolio/proyectos/${id}`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const removeProyecto = async (id: number) => {
  const res = await axios.delete(`${API}/portafolio/proyectos/${id}`, {
    headers: authHeaders(),
  });
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
  const res = await axios.post(`${API}/cursos`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const removeCurso = async (id: number) => {
  const res = await axios.delete(`${API}/cursos/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const getSugerenciasCurso = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await axios.get(`${API}/cursos/sugerencias`, {
    headers: authHeaders(),
    params: { q },
  });
  return res.data.sugerencias ?? [];
};

// ── Educación ─────────────────────────────────────────────────────────────────
export const getEducaciones = async () => {
  const res = await axios.get(`${API}/educacion`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const getSugerenciasInstitucion = async (
  q: string
): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await axios.get(`${API}/educacion/sugerencias`, {
    headers: authHeaders(),
    params: { q },
  });
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
  const res = await axios.post(`${API}/educacion`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const removeEducacion = async (id: number) => {
  const res = await axios.delete(`${API}/educacion/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ── Logros ───────────────────────────────────────────────────────────────────
export const getCatalogoEntidades = async () => {
  const res = await axios.get(`${API}/catalogo/entidades`, {
    headers: authHeaders(),
  });
  return res.data;
};


export const getLogros = async () => {
  const res = await axios.get(`${API}/logros`, {
    headers: authHeaders(),
  });
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
  const res = await axios.post(`${API}/logros`, data, {
    headers: authHeaders(),
  });
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
  const res = await axios.post(`${API}/experiencias`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const getExperiencias = async () => {
  const res = await axios.get(`${API}/experiencias`, {
    headers: authHeaders(),
  });
  return res.data.experiencias;
};

export const getExperiencia = async (id: number) => {
  const res = await axios.get(`${API}/experiencias/${id}`, {
    headers: authHeaders(),
  });
  return res.data.experiencia;
};

export const removeExperiencia = async (id: number) => {
  const res = await axios.delete(`${API}/experiencias/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const removeLogro = async (id: number) => {
  const res = await axios.delete(`${API}/logros/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const addIdioma = async (data: {
  nombre_idioma: string;
  nivel: string;
  visibilidad?: "publico" | "privado";
}) => {
  const res = await axios.post(`${API}/idiomas`, data, {
    headers: authHeaders(),
  });
  return res.data;
};

export const removeIdioma = async (id: number) => {
  const res = await axios.delete(`${API}/idiomas/${id}`, {
    headers: authHeaders(),
  });
  return res.data;
};

// ── Certificaciones ───────────────────────────────────────────────────────────────
export const getCertificaciones = async () => {
  const res = await axios.get(`${API}/certificaciones`, { headers: authHeaders() });
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
  const res = await axios.post(`${API}/certificaciones`, data, { headers: authHeaders() });
  return res.data;
};

export const removeCertificacion = async (id: number) => {
  const res = await axios.delete(`${API}/certificaciones/${id}`, { headers: authHeaders() });
  return res.data;
};

export const getSugerenciasEntidadEmisora = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await axios.get(`${API}/certificaciones/sugerencias`, {
    headers: authHeaders(),
    params: { q },
  });
  return res.data.sugerencias ?? [];
};

export const updateExperiencia = async (id: number, data: ExperienciaPayload) => {
  const res = await axios.put(`${API}/experiencias/${id}`, data, { headers: authHeaders() });
  return res.data;
};

// ── Sugerencias de Empresa (Experiencia) ─────────────────────────────────────
export const getSugerenciasEmpresa = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await axios.get(`${API}/experiencias/sugerencias`, {
    headers: authHeaders(),
    params: { q },
  });
  return res.data.sugerencias ?? [];
};

// ── Sugerencias de Entidad
export const getSugerenciasEntidad = async (q: string): Promise<string[]> => {
  if (q.trim().length < 3) return [];
  const res = await axios.get(`${API}/logros/sugerencias`, {
    headers: authHeaders(),
    params: { q },
  });
  return res.data.sugerencias ?? [];
};

// ── Sugerencias de Idioma ─────────────────────────────────────────────────────
export const getSugerenciasIdioma = async (q: string): Promise<string[]> => {
  if (q.trim().length < 2) return [];
  const res = await axios.get(`${API}/idiomas/sugerencias`, {
    headers: authHeaders(),
    params: { q },
  });
  return res.data.sugerencias ?? [];
};

// ── Sugerencias de Profesión ──────────────────────────────────────────────────
export const getSugerenciasProfecion = async (q: string): Promise<string[]> => {
  if (q.trim().length < 2) return [];
  const res = await axios.get(`${API}/perfil/sugerencias-profesion`, {
    headers: authHeaders(),
    params: { q },
  });
  return res.data.sugerencias ?? [];
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}