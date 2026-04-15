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
// ── Logros ───────────────────────────────────────────────────────────────
export const getLogros = async () => {
  const res = await axios.get(`${API}/logros`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const addLogro = async (data: {
  titulo: string;
  nombre_entidad: string;
  fecha_obtencion: string;
  descripcion?: string;
  url_credencial?: string;
  identificador?: string;
  visibilidad?: "publico" | "privado";
}) => {
  const res = await axios.post(`${API}/logros`, data, {
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
// ── Entidad emisora ───────────────────────────────────────────────────────
export interface EntidadEmisora {
  id_entidad_emisora: number;
  nombre: string;
}

// ── Logro ─────────────────────────────────────────────────────────────────
export interface Logro {
  id_logro: number;
  usuario_id: number;
  entidad_emisora_id: number;
  titulo: string;
  descripcion?: string;
  fecha_obtencion: string;
  url_credencial?: string;
  identificador?: string;
  visibilidad: "publico" | "privado";
  eliminado: boolean;
  entidad_emisora?: EntidadEmisora;
}