import axios from "axios";

const API = "http://localhost:8000/api";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No autenticado");
  return { Authorization: `Bearer ${token}` };
};

export interface AdminUser {
  id_usuario: number;
  correo: string;
  nombre_usuario: string;
  rol: string;
  estado: "activo" | "inhabilitado";
  eliminado: boolean;
  creado_en: string | null;
  perfil: {
    id_perfil: number;
    nombre: string;
    nombre_perfil: string | null;
    apellido_perfil: string | null;
    profesion: string | null;
    foto_url: string | null;
  } | null;
  portafolio: {
    id_publicacion: number;
    slug_publico: string | null;
    publicado: boolean;
    enlace_activo: boolean;
    publicado_en: string | null;
  } | null;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminReportSummary {
  resumen: {
    usuarios_total: number;
    usuarios_activos: number;
    usuarios_inhabilitados: number;
    admins_activos: number;
    perfiles_total: number;
    portafolios_publicados: number;
    portafolios_con_enlace_activo: number;
    visualizaciones_total: number;
    contactos_total: number;
    guardados_total: number;
  };
  top_visualizaciones: AdminRankingItem[];
  top_contactos: AdminRankingItem[];
  usuarios_recientes: Array<{
    id_usuario: number;
    correo: string;
    nombre_usuario: string;
    rol: string;
    estado: "activo" | "inhabilitado";
    creado_en: string | null;
  }>;
}

export interface AdminRankingItem {
  id_publicacion: number;
  slug_publico: string | null;
  usuario_id: number;
  nombre_usuario: string;
  nombre: string;
  profesion: string | null;
  total_visualizaciones?: number;
  total_contactos?: number;
}

export const getAdminUsers = async (params: {
  q?: string;
  estado?: "todos" | "activos" | "inhabilitados";
  rol?: string;
  page?: number;
  per_page?: number;
}): Promise<AdminUsersResponse> => {
  const res = await axios.get(`${API}/admin/usuarios`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
};

export const updateAdminUserStatus = async (
  id: number,
  eliminado: boolean
): Promise<{ message: string; usuario: AdminUser }> => {
  const res = await axios.patch(
    `${API}/admin/usuarios/${id}/estado`,
    { eliminado },
    { headers: authHeaders() }
  );
  return res.data;
};

export const getAdminReportSummary = async (): Promise<AdminReportSummary> => {
  const res = await axios.get(`${API}/admin/reportes/resumen`, {
    headers: authHeaders(),
  });
  return res.data;
};
