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

// ── Tipos de reportes de portafolios ──────────────────────────────────────

export type EstadoReporte = "pendiente" | "revisado" | "desestimado";

export interface ReportePortafolio {
  id_reporte: number;
  publicacion_id: number;
  slug_publico: string | null;
  nombre_reportado: string;
  nombre_usuario_reportado: string;
  usuario_id_reportado: number;
  estado_cuenta: "activo" | "inhabilitado";
  eliminado: boolean;
  motivo: string;
  comentario: string | null;
  estado: EstadoReporte;
  nota_moderador: string | null;
  reportado_por_nombre: string | null;
  creado_en: string;
  revisado_en: string | null;
}

export interface ReportesPortafolioResponse {
  data: ReportePortafolio[];
  current_page: number;
  last_page: number;
  total: number;
}

export const getReportesPortafolios = async (params?: {
  estado?: EstadoReporte | "todos";
  page?: number;
  per_page?: number;
}): Promise<ReportesPortafolioResponse> => {
  const res = await axios.get(`${API}/admin/reportes/portafolios`, {
    headers: authHeaders(),
    params,
  });
  return res.data;
};

export const resolverReporte = async (
  idReporte: number,
  data: {
    estado: "revisado" | "desestimado";
    nota_moderador?: string;
    accion_cuenta?: "inhabilitar" | "habilitar" | null;
  }
): Promise<{ message: string; reporte: ReportePortafolio }> => {
  const res = await axios.patch(
    `${API}/admin/reportes/portafolios/${idReporte}/resolver`,
    data,
    { headers: authHeaders() }
  );
  return res.data;
};
// ── Reportes agrupados por publicación ───────────────────────────────────

/** Un grupo: una publicación + todos sus reportes + conteo total */
export interface ReportesDePublicacion {
  publicacion_id: number;
  slug_publico: string | null;
  nombre_reportado: string;
  nombre_usuario_reportado: string;
  usuario_id_reportado: number;
  eliminado: boolean;
  total_reportes: number;
  pendientes: number;
  revisados: number;
  desestimados: number;
  ultimo_reporte_en: string;
  reportes: ReportePortafolio[];
}

export interface ReportesPorPublicacionResponse {
  data: ReportesDePublicacion[];
  current_page: number;
  last_page: number;
  total: number;
}

/**
 * Descarga todos los reportes del backend y los agrupa por publicacion_id
 * en el cliente. Pagina automáticamente hasta 10 páginas (≈1 000 reportes).
 */
export const getReportesPorPublicacion = async (params?: {
  estado?: EstadoReporte | "todos";
}): Promise<ReportesPorPublicacionResponse> => {
  const PER_PAGE = 100;
  let page = 1;
  let lastPage = 1;
  const todos: ReportePortafolio[] = [];

  do {
    const res = await axios.get<ReportesPortafolioResponse>(
      `${API}/admin/reportes/portafolios`,
      {
        headers: authHeaders(),
        params: { estado: params?.estado ?? "todos", page, per_page: PER_PAGE },
      }
    );
    todos.push(...res.data.data);
    lastPage = res.data.last_page;
    page++;
  } while (page <= lastPage && page <= 10); // tope: 1 000 reportes

  // Agrupar por publicacion_id
  const mapa = new Map<number, ReportesDePublicacion>();

  for (const r of todos) {
    const key = r.publicacion_id;
    if (!mapa.has(key)) {
      mapa.set(key, {
        publicacion_id: key,
        slug_publico: r.slug_publico,
        nombre_reportado: r.nombre_reportado,
        nombre_usuario_reportado: r.nombre_usuario_reportado,
        usuario_id_reportado: r.usuario_id_reportado,
        eliminado: r.eliminado,
        total_reportes: 0,
        pendientes: 0,
        revisados: 0,
        desestimados: 0,
        ultimo_reporte_en: r.creado_en,
        reportes: [],
      });
    }
    const grupo = mapa.get(key)!;
    grupo.total_reportes += 1;
    if (r.estado === "pendiente") grupo.pendientes += 1;
    else if (r.estado === "revisado") grupo.revisados += 1;
    else if (r.estado === "desestimado") grupo.desestimados += 1;
    if (r.creado_en > grupo.ultimo_reporte_en) {
      grupo.ultimo_reporte_en = r.creado_en;
    }
    // Ordenar reportes individuales: más recientes primero
    grupo.reportes.push(r);
  }

  // Ordenar grupos: más reportes pendientes primero, luego total, luego más recientes
  const data = Array.from(mapa.values())
    .map((g) => ({
      ...g,
      reportes: g.reportes.sort((a, b) =>
        b.creado_en.localeCompare(a.creado_en)
      ),
    }))
    .sort((a, b) => {
      if (b.pendientes !== a.pendientes) return b.pendientes - a.pendientes;
      if (b.total_reportes !== a.total_reportes)
        return b.total_reportes - a.total_reportes;
      return b.ultimo_reporte_en.localeCompare(a.ultimo_reporte_en);
    });

  return { data, current_page: 1, last_page: 1, total: data.length };
};