import axios from "axios";

import type {
  ConfiguracionSecciones,
  EstadoPublicacionPortafolio,
  EstadoGuardadoPortafolio,
  GradoEducacion,
  GithubProyectoImportado,
  PortafolioData,
  PortafolioGuardadoResumen,
  PortafolioPublicoResumen,
  RolCurso,
} from '../types/portafolioTypes';

const API = "http://localhost:8000/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");
  return { Authorization: `Bearer ${token}` };
};

const buildPublicPortfolioUrl = (slug: string | null | undefined): string | null => {
  if (!slug) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  return `${origin}/portafolio/publico/${slug}`;
};

const normalizePublicationState = (
  publicacion: EstadoPublicacionPortafolio
): EstadoPublicacionPortafolio => ({
  ...publicacion,
  visualizaciones: Number(publicacion.visualizaciones ?? 0),
  url_publica: publicacion.enlace_activo
    ? buildPublicPortfolioUrl(publicacion.slug_publico) ?? publicacion.url_publica
    : null,
});

const normalizePublicPortfolioSummary = <T extends PortafolioPublicoResumen>(portafolio: T): T => ({
  ...portafolio,
  perfil_privado: Boolean(portafolio.perfil_privado),
  url_publica: buildPublicPortfolioUrl(portafolio.slug_publico) ?? portafolio.url_publica,
});

const getVisitSession = (): string => {
  const key = "portfolio_visit_session";
  const current = localStorage.getItem(key);

  if (current) return current;

  const next = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  localStorage.setItem(key, next);
  return next;
};

export const getPortafolio = async () => {
  const res = await axios.get(`${API}/portafolio`, { headers: authHeaders() });
  return res.data;
};

export const getPerfilMe = async () => {
  const res = await axios.get(`${API}/perfil/me`, { headers: authHeaders() });
  return res.data;
};

export const updatePerfil = async (data: {
  nombre_perfil?: string;
  apellido_perfil?: string;
  profesion?: string;
  celular?: string;
  descripcion?: string;
  foto_url?: string;
  ciudad?: string | null;
  pais?: string | null;
  correo_contacto?: string | null;
  enlaces_personalizados?: { titulo: string; url: string }[];
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
    if (data.ciudad !== undefined) formData.append("ciudad", data.ciudad ?? "");
    if (data.pais !== undefined) formData.append("pais", data.pais ?? "");
    if (data.correo_contacto !== undefined) formData.append("correo_contacto", data.correo_contacto ?? "");
    if (data.enlaces_personalizados !== undefined) {
      formData.append("enlaces_personalizados_json", JSON.stringify(data.enlaces_personalizados));
      data.enlaces_personalizados.forEach((enlace, index) => {
        formData.append(`enlaces_personalizados[${index}][titulo]`, enlace.titulo);
        formData.append(`enlaces_personalizados[${index}][url]`, enlace.url);
      });
    }

    const blob = dataUrlToBlob(data.foto_url!);
    const ext = blob.type.split("/")[1] ?? "jpg";
    formData.append("foto_file", blob, `foto.${ext}`);

    const res = await axios.post(`${API}/portafolio/perfil`, formData, {
      headers: { ...authHeaders() },
    });
    console.log("Response:", res.data);
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

// ── GitHub ───────────────────────────────────────────────────────────────────
export const getGithubConnection = async (): Promise<{
  github_username: string | null;
  github_conectado_en: string | null;
}> => {
  const res = await axios.get(`${API}/github`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const saveGithubUsername = async (github_username: string): Promise<{
  message: string;
  github_username: string;
  github_conectado_en: string | null;
}> => {
  const res = await axios.post(`${API}/github`, { github_username }, {
    headers: authHeaders(),
  });
  return res.data;
};

export const getGithubRepos = async (username?: string): Promise<{
  github_username: string;
  repositorios: Omit<GithubProyectoImportado, "id_proyecto">[];
}> => {
  const res = await axios.get(`${API}/github/repos`, {
    headers: authHeaders(),
    params: username ? { username } : undefined,
  });
  return res.data;
};

// ── Cursos ────────────────────────────────────────────────────────────────────
export const addCurso = async (data: {
  nombre_curso: string;
  institucion: string;
  rol_curso?: RolCurso;
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

// ── Educación (Grado de Formación) ────────────────────────────────────────────
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

// HU-8: el campo "grado" ahora es obligatorio para educación formal.
export const addEducacion = async (data: {
  institucion: string;
  titulo: string;
  area_estudio?: string;
  grado: GradoEducacion;           // obligatorio
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

// HU-8: update también requiere grado.
export const updateEducacion = async (
  id: number,
  data: {
    institucion?: string;
    titulo?: string;
    area_estudio?: string;
    grado?: GradoEducacion;
    fecha_inicio?: string;
    fecha_fin?: string;
    descripcion?: string;
    visibilidad?: "publico" | "privado";
  }
) => {
  const res = await axios.put(`${API}/educacion/${id}`, data, {
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

/** Obtiene la configuración de secciones visibles del portafolio. */
export const getVisibilidadSecciones = async (): Promise<ConfiguracionSecciones> => {
  const res = await axios.get(`${API}/visibilidad/secciones`, {
    headers: authHeaders(),
  });
  return res.data.configuracion;
};

/** Guarda la configuración de secciones visibles del portafolio. */
export const updateVisibilidadSecciones = async (
  data: ConfiguracionSecciones
): Promise<ConfiguracionSecciones> => {
  const res = await axios.put(`${API}/visibilidad/secciones`, data, {
    headers: authHeaders(),
  });
  return res.data.configuracion;
};

export const getEstadoPublicacion = async (): Promise<EstadoPublicacionPortafolio> => {
  const res = await axios.get(`${API}/portafolio/publicacion`, {
    headers: authHeaders(),
  });
  return normalizePublicationState(res.data.publicacion);
};

export const getPortafoliosPublicos = async (
  limite = 12,
  busqueda?: string
): Promise<PortafolioPublicoResumen[]> => {
  const res = await axios.get(`${API}/portafolios/publicos`, {
    headers: authHeaders(),
    params: { limite, q: busqueda || undefined },
  });
  return (res.data.portafolios ?? []).map(normalizePublicPortfolioSummary);
};

export const getDashboardPortafolios = async (limite = 12): Promise<{
  publicacion: EstadoPublicacionPortafolio;
  portafolios: PortafolioPublicoResumen[];
}> => {
  const res = await axios.get(`${API}/dashboard/portafolios`, {
    headers: authHeaders(),
    params: { limite },
  });

  return {
    publicacion: normalizePublicationState(res.data.publicacion),
    portafolios: (res.data.portafolios ?? []).map(normalizePublicPortfolioSummary),
  };
};

export const getPortafoliosGuardados = async (): Promise<PortafolioGuardadoResumen[]> => {
  const res = await axios.get(`${API}/portafolios/guardados`, {
    headers: authHeaders(),
  });
  return (res.data.guardados ?? []).map(normalizePublicPortfolioSummary);
};

export const getEstadoGuardado = async (slug: string): Promise<EstadoGuardadoPortafolio> => {
  const res = await axios.get(`${API}/portafolios/${slug}/guardado`, {
    headers: authHeaders(),
  });
  return res.data;
};

export const guardarPortafolio = async (slug: string): Promise<EstadoGuardadoPortafolio> => {
  const res = await axios.post(`${API}/portafolios/${slug}/guardar`, {}, {
    headers: authHeaders(),
  });
  return res.data.data;
};

export const eliminarPortafolioGuardado = async (slug: string): Promise<EstadoGuardadoPortafolio> => {
  const res = await axios.delete(`${API}/portafolios/${slug}/guardar`, {
    headers: authHeaders(),
  });
  return res.data.data;
};

export const publicarPortafolio = async (): Promise<EstadoPublicacionPortafolio> => {
  const res = await axios.post(`${API}/portafolio/publicar`, {}, {
    headers: authHeaders(),
  });
  return normalizePublicationState(res.data.publicacion);
};

export const despublicarPortafolio = async (): Promise<EstadoPublicacionPortafolio> => {
  const res = await axios.post(`${API}/portafolio/despublicar`, {}, {
    headers: authHeaders(),
  });
  return normalizePublicationState(res.data.publicacion);
};

export const generarEnlacePublico = async (): Promise<EstadoPublicacionPortafolio> => {
  const res = await axios.post(`${API}/portafolio/enlace/generar`, {}, {
    headers: authHeaders(),
  });
  return normalizePublicationState(res.data.publicacion);
};

export const revocarEnlacePublico = async (): Promise<EstadoPublicacionPortafolio> => {
  const res = await axios.post(`${API}/portafolio/enlace/revocar`, {}, {
    headers: authHeaders(),
  });
  return normalizePublicationState(res.data.publicacion);
};

export const getPortafolioPublico = async (slug: string): Promise<PortafolioData> => {
  const res = await axios.get(`${API}/public/portafolios/${slug}`);
  const portafolio = res.data.portafolio ?? {};
  type PublicRecord = Record<string, unknown> & {
    entidad_emisora?: { nombre?: string | null } | null;
    entidadEmisora?: { nombre?: string | null } | null;
    nombre_entidad?: string | null;
    entidad_nombre?: string | null;
    imagen_url?: string | null;
  };

  return {
    ...portafolio,
    perfil: portafolio.perfil ?? null,
    contacto_directo: portafolio.contacto_directo ?? { habilitado: false, correo: null },
    habilidades_tecnicas: portafolio.habilidades_tecnicas ?? [],
    habilidades_blandas: portafolio.habilidades_blandas ?? [],
    proyectos: portafolio.proyectos ?? [],
    educaciones: portafolio.educaciones ?? [],
    cursos: portafolio.cursos ?? [],
    idiomas: portafolio.idiomas ?? [],
    experiencias: portafolio.experiencias ?? [],
    configuracion: portafolio.configuracion,
    certificaciones: (portafolio.certificaciones ?? []).map((cert: PublicRecord) => ({
      ...cert,
      nombre_entidad: cert.nombre_entidad ?? cert.entidad_emisora?.nombre ?? cert.entidadEmisora?.nombre ?? "",
      imagen_url: cert.imagen_url ?? null,
    })),
    logros: (portafolio.logros ?? []).map((logro: PublicRecord) => ({
      ...logro,
      entidad_nombre: logro.entidad_nombre ?? logro.entidad_emisora?.nombre ?? logro.entidadEmisora?.nombre ?? null,
    })),
  };
};

export const registrarContactoDirecto = async (slug: string): Promise<{ mailto: string }> => {
  const res = await axios.post(`${API}/public/portafolios/${slug}/contacto`);
  return res.data;
};

export const registrarVisualizacionPortafolio = async (slug: string): Promise<void> => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "X-Visit-Session": getVisitSession(),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  await axios.post(`${API}/public/portafolios/${slug}/visualizacion`, {}, { headers });
};
