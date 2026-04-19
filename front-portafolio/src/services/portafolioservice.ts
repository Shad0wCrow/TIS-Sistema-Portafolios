import axios from "axios";

const API = "http://localhost:8000/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Portafolio completo ───────────────────────────────────────────────────────
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

// ── Educación ─────────────────────────────────────────────────────────────────
export const getEducaciones = async () => {
  const res = await axios.get(`${API}/educacion`, { headers: authHeaders() });
  return res.data; // { educaciones: Educacion[] }
};

/**
 * Obtiene sugerencias de instituciones desde la base de datos
 * según el término ingresado (mínimo 3 caracteres). CA #10
 */
export const getSugerenciasInstitucion = async (q: string): Promise<string[]> => {
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