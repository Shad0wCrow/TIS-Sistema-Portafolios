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

// ── Experiencia ───────────────────────────────────────────────────────────────

// Tipo reutilizable (para no vivir en el caos)
type ExperienciaPayload = {
  nombre_empresa: string;
  puesto: string;
  tipo?: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  es_actual?: boolean;
  ubicacion?: string;
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