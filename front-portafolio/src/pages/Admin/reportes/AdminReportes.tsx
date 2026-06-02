import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/ui/ConfirmModal/ConfirmModal";
import {
  getReportesPortafolios,
  getReportesPorPublicacion,
  resolverReporte,
  getAdminUsers,
  updateAdminUserStatus,
  getAdminUserStateHistory,
  getSolicitudesReactivacion,
  resolverSolicitudReactivacion,
  type EstadoReporte,
  type ReportePortafolio,
  type ReportesDePublicacion,
  type AdminUser,
  type AdminUserStateHistoryEvent,
  type SolicitudReactivacion,
  type EstadoSolicitud,
} from "../../../services/adminService";
import "../AdminDashboard.css";
import "../AdminReportes.css";
import "../UsuariosReportados.css";
import "./Adminreportestabs.css";


const MOTIVO_LABELS: Record<string, string> = {
  contenido_inapropiado: "Contenido inapropiado",
  spam: "Spam",
  perfil_falso: "Perfil falso",
  informacion_falsa: "Información falsa",
  derechos_autor: "Derechos de autor",
  acoso: "Acoso",
  otro: "Otro",
};

const PER_PAGE = 10;
type Vista = "reportes" | "por_publicacion" | "usuarios" | "reactivaciones";

export default function AdminReportes() {
  const navigate = useNavigate();

  // ── Tab activo ────────────────────────────────────────────────────────────
  const [vista, setVista] = useState<Vista>("reportes");

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function showMessage(msg: string) {
    setMessage(msg);
    setError(null);
    setTimeout(() => setMessage(null), 3500);
  }
  function showError(msg: string) {
    setError(msg);
    setMessage(null);
    setTimeout(() => setError(null), 4000);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 1: USUARIOS REPORTADOS (HU-95)
  // ══════════════════════════════════════════════════════════════════════════
  const [reportes, setReportes] = useState<ReportePortafolio[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | "todos">("pendiente");
  const [pageReportes, setPageReportes] = useState(1);
  const [lastPageReportes, setLastPageReportes] = useState(1);
  const [totalReportes, setTotalReportes] = useState(0);
  const [loadingReportes, setLoadingReportes] = useState(true);

  // HU-95: reporte seleccionado (fila completa clickeable)
  const [reporteSeleccionado, setReporteSeleccionado] = useState<ReportePortafolio | null>(null);

  // HU-95: modal de resolución
  const [modalResolucionAbierto, setModalResolucionAbierto] = useState(false);
  const [accionResolucion, setAccionResolucion] = useState<"inhabilitar" | "desestimar" | null>(null);
  const [comentarioDesestimar, setComentarioDesestimar] = useState("");
  const [comentarioError, setComentarioError] = useState(false);
  const [resolviendo, setResolviendo] = useState(false);
  const comentarioRef = useRef<HTMLTextAreaElement>(null);

  const cargarReportes = useCallback(async () => {
    setLoadingReportes(true);
    try {
      const res = await getReportesPortafolios({
        estado: filtroEstado,
        page: pageReportes,
        per_page: PER_PAGE,
      });
      setReportes(res.data);
      setLastPageReportes(res.last_page);
      setTotalReportes(res.total);
    } catch {
      showError("No se pudieron cargar los reportes.");
    } finally {
      setLoadingReportes(false);
    }
  }, [filtroEstado, pageReportes]);

  useEffect(() => {
    if (vista === "reportes") cargarReportes();
  }, [cargarReportes, vista]);

  useEffect(() => { setPageReportes(1); }, [filtroEstado]);

  // HU-95 CA1/CA2: "Resolver conflictos" — abre flujo o muestra aviso
  function handleResolverConflictos() {
    if (!reporteSeleccionado) {
      showError("Selecciona el reporte a Resolver");
      return;
    }
    setAccionResolucion(null);
    setComentarioDesestimar("");
    setComentarioError(false);
    setModalResolucionAbierto(true);
  }

  // HU-95 CA7/CA8/CA9: confirmar resolución
  async function confirmarResolucionHU95() {
    if (!reporteSeleccionado || !accionResolucion) return;

    // CA9: comentario obligatorio para desestimar
    if (accionResolucion === "desestimar" && !comentarioDesestimar.trim()) {
      setComentarioError(true);
      comentarioRef.current?.focus();
      return;
    }

    setResolviendo(true);
    try {
      let estadoFinal: "revisado" | "desestimado";
      let accionCuenta: "inhabilitar" | "habilitar" | null = null;

      if (accionResolucion === "inhabilitar") {
        estadoFinal = "revisado";
        accionCuenta = reporteSeleccionado.eliminado ? "habilitar" : "inhabilitar";
      } else {
        estadoFinal = "desestimado";
        accionCuenta = null;
      }

      const res = await resolverReporte(reporteSeleccionado.id_reporte, {
        estado: estadoFinal,
        nota_moderador: accionResolucion === "desestimar" ? comentarioDesestimar.trim() : undefined,
        accion_cuenta: accionCuenta,
      });

      showMessage(res.message);
      setModalResolucionAbierto(false);
      setReporteSeleccionado(null);

      // CA10: reflejar nuevo estado en la lista
      if (filtroEstado === "pendiente") {
        setReportes((prev) => prev.filter((r) => r.id_reporte !== reporteSeleccionado.id_reporte));
        setTotalReportes((t) => Math.max(0, t - 1));
      } else {
        setReportes((prev) =>
          prev.map((r) => r.id_reporte === reporteSeleccionado.id_reporte ? res.reporte : r)
        );
      }

      // Refrescar agrupados si estaban cargados
      if (grupos.length > 0) cargarGrupos();
    } catch (err: any) {
      showError(err?.response?.data?.message || "Error al resolver el reporte.");
    } finally {
      setResolviendo(false);
    }
  }

  const pendientesCount = filtroEstado === "pendiente" ? totalReportes : undefined;

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 2: REPORTES AGRUPADOS POR PUBLICACIÓN
  // ══════════════════════════════════════════════════════════════════════════
  const [grupos, setGrupos] = useState<ReportesDePublicacion[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState<EstadoReporte | "todos">("todos");
  const [grupoExpandido, setGrupoExpandido] = useState<string | null>(null);

  // HU-95 CA4/CA5: reporte seleccionado en "Por publicación"
  const [reporteSeleccionadoGrupo, setReporteSeleccionadoGrupo] = useState<ReportePortafolio | null>(null);
  const [modalGrupoAbierto, setModalGrupoAbierto] = useState(false);
  const [accionGrupo, setAccionGrupo] = useState<"inhabilitar" | "desestimar" | null>(null);
  const [comentarioGrupo, setComentarioGrupo] = useState("");
  const [comentarioGrupoError, setComentarioGrupoError] = useState(false);
  const [resolviendoGrupo, setResolviendoGrupo] = useState(false);
  const comentarioGrupoRef = useRef<HTMLTextAreaElement>(null);

  const cargarGrupos = useCallback(async () => {
    setLoadingGrupos(true);
    try {
      const res = await getReportesPorPublicacion({ estado: filtroGrupo });
      setGrupos(res.data);
    } catch {
      showError("No se pudieron cargar los reportes agrupados.");
    } finally {
      setLoadingGrupos(false);
    }
  }, [filtroGrupo]);

  useEffect(() => {
    if (vista === "por_publicacion") cargarGrupos();
  }, [cargarGrupos, vista]);

  useEffect(() => { setGrupoExpandido(null); }, [filtroGrupo]);

  function toggleGrupo(id: string) {
    setGrupoExpandido((prev) => (prev === id ? null : id));
  }

  function abrirResolucionGrupo(r: ReportePortafolio) {
    setReporteSeleccionadoGrupo(r);
    setAccionGrupo(null);
    setComentarioGrupo("");
    setComentarioGrupoError(false);
    setModalGrupoAbierto(true);
  }

  async function confirmarResolucionGrupo() {
    if (!reporteSeleccionadoGrupo || !accionGrupo) return;
    if (accionGrupo === "desestimar" && !comentarioGrupo.trim()) {
      setComentarioGrupoError(true);
      comentarioGrupoRef.current?.focus();
      return;
    }
    setResolviendoGrupo(true);
    try {
      const estadoFinal: "revisado" | "desestimado" =
        accionGrupo === "inhabilitar" ? "revisado" : "desestimado";
      const accionCuenta =
        accionGrupo === "inhabilitar"
          ? reporteSeleccionadoGrupo.eliminado ? "habilitar" : "inhabilitar"
          : null;

      const res = await resolverReporte(reporteSeleccionadoGrupo.id_reporte, {
        estado: estadoFinal,
        nota_moderador: accionGrupo === "desestimar" ? comentarioGrupo.trim() : undefined,
        accion_cuenta: accionCuenta,
      });
      showMessage(res.message);
      setModalGrupoAbierto(false);
      setReporteSeleccionadoGrupo(null);
      cargarGrupos();
    } catch (err: any) {
      showError(err?.response?.data?.message || "Error al resolver el reporte.");
    } finally {
      setResolviendoGrupo(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3: GESTIÓN DE USUARIOS (HU-45 + HU-46)
  // ══════════════════════════════════════════════════════════════════════════
  const currentUserId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return null;
      const user = JSON.parse(rawUser) as { id_usuario?: number; id?: number } | null;
      return typeof user?.id_usuario === "number"
        ? user.id_usuario
        : typeof user?.id === "number" ? user.id : null;
    } catch { return null; }
  }, []);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [estadoUsuario, setEstadoUsuario] = useState<"todos" | "activos" | "inhabilitados">("todos");
  const [rol, setRol] = useState("");
  const [pageUsuarios, setPageUsuarios] = useState(1);
  const [lastPageUsuarios, setLastPageUsuarios] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [userToToggle, setUserToToggle] = useState<AdminUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [historialEstados, setHistorialEstados] = useState<AdminUserStateHistoryEvent[]>([]);
  const [loadingHistorialEstados, setLoadingHistorialEstados] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await getAdminUsers({
        q: search.trim() || undefined,
        estado: estadoUsuario,
        rol: rol.trim() || undefined,
        page: pageUsuarios,
        per_page: PER_PAGE,
      });
      setUsers(data.data);
      setLastPageUsuarios(data.last_page);
      setTotalUsuarios(data.total);
    } catch {
      setUsers([]);
      showError("No se pudieron cargar los usuarios.");
    } finally {
      setLoadingUsers(false);
    }
  }, [search, estadoUsuario, rol, pageUsuarios]);

  useEffect(() => {
    if (vista === "usuarios") loadUsers();
  }, [loadUsers, vista]);

  const loadStateHistory = useCallback(async () => {
    setLoadingHistorialEstados(true);
    try {
      const data = await getAdminUserStateHistory({ accion: "todos", per_page: 8 });
      setHistorialEstados(data.data);
    } catch {
      setHistorialEstados([]);
    } finally {
      setLoadingHistorialEstados(false);
    }
  }, []);

  useEffect(() => {
    if (vista === "usuarios") loadStateHistory();
  }, [loadStateHistory, vista]);

  async function confirmToggle() {
    if (!userToToggle) return;
    setUpdatingUserId(userToToggle.id_usuario);
    try {
      const response = await updateAdminUserStatus(userToToggle.id_usuario, !userToToggle.eliminado);
      showMessage(response.message);
      setUserToToggle(null);
      setSelectedUser(null);
      await loadUsers();
      await loadStateHistory();
    } catch (err: any) {
      showError(err?.response?.data?.message || "No se pudo actualizar el estado.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 4: SOLICITUDES DE REACTIVACIÓN (HU-95 CAs 11–18)
  // ══════════════════════════════════════════════════════════════════════════
  const [solicitudes, setSolicitudes] = useState<SolicitudReactivacion[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [filtroSolicitud, setFiltroSolicitud] = useState<EstadoSolicitud | "todos">("pendiente");
  const [solicitudActiva, setSolicitudActiva] = useState<SolicitudReactivacion | null>(null);
  const [resolviendoSolicitud, setResolviendoSolicitud] = useState(false);
  const [pageSolicitudes, setPageSolicitudes] = useState(1);
  const [lastPageSolicitudes, setLastPageSolicitudes] = useState(1);
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);

  const cargarSolicitudes = useCallback(async () => {
    setLoadingSolicitudes(true);
    try {
      const res = await getSolicitudesReactivacion({
        estado: filtroSolicitud,
        page: pageSolicitudes,
        per_page: PER_PAGE,
      });
      setSolicitudes(res.data);
      setLastPageSolicitudes(res.last_page);
      setTotalSolicitudes(res.total);
    } catch {
      setSolicitudes([]);
      setLastPageSolicitudes(1);
      setTotalSolicitudes(0);
    } finally {
      setLoadingSolicitudes(false);
    }
  }, [filtroSolicitud, pageSolicitudes]);

  useEffect(() => {
    if (vista === "reactivaciones") cargarSolicitudes();
  }, [cargarSolicitudes, vista]);

  useEffect(() => { setPageSolicitudes(1); }, [filtroSolicitud]);

  async function resolverSolicitud(accion: "aceptar" | "rechazar") {
      if (!solicitudActiva) return;
      setResolviendoSolicitud(true);
      try {
        const res = await resolverSolicitudReactivacion(solicitudActiva.id_solicitud, accion);
        showMessage(res.message);

        const solicitudActualizada: SolicitudReactivacion = {
          ...solicitudActiva,
          estado:      res.solicitud.estado,
          revisado_en: res.solicitud.revisado_en,
        };
        
        setSolicitudes((prev) =>
          prev.map((s) =>
            s.id_solicitud === solicitudActiva.id_solicitud ? solicitudActualizada : s
          )
        );
        setSolicitudActiva(solicitudActualizada);
      } catch (err: any) {
        showError(err?.response?.data?.message || "No se pudo resolver la solicitud.");
      } finally {
        setResolviendoSolicitud(false);
      }
    }

  // ── Logout ────────────────────────────────────────────────────────────────
  function handleLogout() {
    ["token", "user", "hasProfile", "hasPortafolio"].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("dashboardPortafoliosCache");
    navigate("/login");
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="admin-page admin-users-page">

      {/* ── Header ── */}
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Devfolio</span>
          <h1>Reportes y usuarios</h1>
        </div>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <Link to="/admin" className="admin-nav-link">Dashboard</Link>
          <Link to="/admin/estadisticas-usuarios" className="admin-nav-link">Estadísticas Usuarios</Link>
          <Link to="/admin/estadisticas-portafolios" className="admin-nav-link">Estadísticas Portafolios</Link>
          <span className="admin-nav-link admin-nav-link--active">
            Reportes y usuarios
            {pendientesCount !== undefined && pendientesCount > 0 && (
              <span className="ar-nav-badge">{pendientesCount}</span>
            )}
          </span>
        </nav>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </header>

      {/* ── Toast ── */}
      {(message || error) && (
        <div className={`ar-toast${error ? " ar-toast--error" : ""}`} role="alert" aria-live="assertive">
          {error || message}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="ar-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={vista === "reportes"}
          className={`ar-tab${vista === "reportes" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("reportes")}
          tabIndex={vista === "reportes" ? 0 : -1}
        >
          Usuarios reportados
          {pendientesCount !== undefined && pendientesCount > 0 && (
            <span className="ar-nav-badge">{pendientesCount}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={vista === "por_publicacion"}
          className={`ar-tab${vista === "por_publicacion" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("por_publicacion")}
          tabIndex={vista === "por_publicacion" ? 0 : -1}
        >
          Por publicación
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={vista === "usuarios"}
          className={`ar-tab${vista === "usuarios" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("usuarios")}
          tabIndex={vista === "usuarios" ? 0 : -1}
        >
          Gestión de usuarios
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={vista === "reactivaciones"}
          className={`ar-tab${vista === "reactivaciones" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("reactivaciones")}
          tabIndex={vista === "reactivaciones" ? 0 : -1}
        >
          Solicitudes de reactivación
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB 1: USUARIOS REPORTADOS (HU-95)
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "reportes" && (
        <div className="ar-layout" role="tabpanel">
          <main className="ar-main">
            <div className="ar-section-head">
              <div>
                <h2 className="ar-section-title">Portafolios reportados</h2>
                <p className="ar-section-subtitle">
                  {totalReportes} reporte{totalReportes !== 1 ? "s" : ""} encontrado{totalReportes !== 1 ? "s" : ""}
                  {reporteSeleccionado && (
                    <span className="ar-selected-hint">
                      {" "}· Reporte #{reporteSeleccionado.id_reporte} seleccionado
                    </span>
                  )}
                </p>
              </div>
              <div className="ar-section-head-actions">
                <div className="ar-filters">
                  {(["todos", "pendiente", "revisado", "desestimado"] as const).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setFiltroEstado(e)}
                      className={`ar-filter-btn${filtroEstado === e ? " ar-filter-btn--active" : ""}`}
                    >
                      {e === "todos" ? "Todos" : capitalize(e)}
                    </button>
                  ))}
                </div>
                {/* CA1: único botón "Resolver conflictos" */}
                <button
                  type="button"
                  className={`ar-resolve-main-btn${reporteSeleccionado ? " ar-resolve-main-btn--ready" : ""}`}
                  onClick={handleResolverConflictos}
                  aria-label="Resolver conflicto del reporte seleccionado"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Resolver conflictos
                </button>
              </div>
            </div>

            <div className="admin-table-wrap">
              {loadingReportes ? (
                <div className="admin-table-state">Cargando reportes…</div>
              ) : reportes.length === 0 ? (
                <div className="admin-table-state">
                  No hay reportes{filtroEstado !== "todos" ? ` con estado "${filtroEstado}"` : ""}.
                </div>
              ) : (
                <table className="admin-users-table ar-table" aria-label="Lista de usuarios reportados">
                  <thead>
                    <tr>
                      <th scope="col">Selección</th>
                      <th scope="col">Usuario reportado</th>
                      <th scope="col">Motivo</th>
                      <th scope="col">Reportado por</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Cuenta</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportes.map((r) => {
                      const selected = reporteSeleccionado?.id_reporte === r.id_reporte;
                      return (
                        // CA3: fila completa clickeable como botón
                        <tr
                          key={r.id_reporte}
                          role="button"
                          aria-pressed={selected}
                          tabIndex={0}
                          className={`ar-row ar-row--selectable${selected ? " ar-row--selected" : ""}`}
                          onClick={() => setReporteSeleccionado(selected ? null : r)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setReporteSeleccionado(selected ? null : r);
                            }
                          }}
                          title={selected ? "Haz clic para deseleccionar" : "Haz clic para seleccionar este reporte"}
                        >
                          <td>
                            <span className={`ar-row-check${selected ? " ar-row-check--on" : ""}`} aria-hidden="true">
                              {selected ? "✓" : "○"}
                            </span>
                          </td>
                          <td>
                            <div className="ar-user-cell">
                              <div className="ar-user-initials">
                                {r.nombre_reportado.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{r.nombre_reportado}</strong>
                                <span>@{r.nombre_usuario_reportado}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="ar-motivo-chip">{MOTIVO_LABELS[r.motivo] ?? r.motivo}</span>
                            {r.comentario && (
                              <span className="ar-comentario-hint" title={r.comentario}>💬</span>
                            )}
                          </td>
                          <td className="admin-muted">
                            {r.reportado_por_nombre ? `@${r.reportado_por_nombre}` : "Visitante"}
                          </td>
                          <td className="ar-fecha">
                            {new Date(r.creado_en).toLocaleDateString("es", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td>
                            <span className={`admin-badge${r.eliminado ? " admin-badge-disabled" : " admin-badge-active"}`}>
                              {r.eliminado ? "Inhabilitado" : "Activo"}
                            </span>
                          </td>
                          <td><EstadoBadge estado={r.estado} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {lastPageReportes > 1 && (
              <div className="admin-pagination">
                <button type="button" onClick={() => setPageReportes((p) => Math.max(1, p - 1))}
                  disabled={pageReportes <= 1 || loadingReportes}>← Anterior</button>
                <span>Página {pageReportes} de {lastPageReportes}</span>
                <button type="button" onClick={() => setPageReportes((p) => Math.min(lastPageReportes, p + 1))}
                  disabled={pageReportes >= lastPageReportes || loadingReportes}>Siguiente →</button>
              </div>
            )}
          </main>

          {/* Panel de instrucciones / reporte seleccionado */}
          <aside className="ar-preview" aria-label="Detalle del reporte seleccionado">
            {!reporteSeleccionado ? (
              <div className="ar-preview-empty">
                <div className="ar-preview-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p>Selecciona un reporte de la lista<br />y luego haz clic en <strong>"Resolver conflictos"</strong></p>
              </div>
            ) : (
              <PreviewReporteHU95
                reporte={reporteSeleccionado}
                onClose={() => setReporteSeleccionado(null)}
                onResolver={handleResolverConflictos}
              />
            )}
          </aside>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2: POR PUBLICACIÓN (HU-95 CA4/CA5)
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "por_publicacion" && (
        <div className="ar-layout ar-layout--single" role="tabpanel">
          <main className="ar-main" style={{ maxWidth: "100%" }}>
            <div className="ar-section-head">
              <div>
                <h2 className="ar-section-title">Reportes por publicación</h2>
                <p className="ar-section-subtitle">
                  {loadingGrupos
                    ? "Cargando…"
                    : `${grupos.length} publicación${grupos.length !== 1 ? "es" : ""} reportada${grupos.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div className="ar-filters">
                  {(["todos", "pendiente", "revisado", "desestimado"] as const).map((e) => (
                    <button key={e} type="button"
                      onClick={() => setFiltroGrupo(e)}
                      className={`ar-filter-btn${filtroGrupo === e ? " ar-filter-btn--active" : ""}`}>
                      {e === "todos" ? "Todos" : capitalize(e)}
                    </button>
                  ))}
                </div>
                <button type="button" className="admin-refresh-btn"
                  onClick={cargarGrupos} disabled={loadingGrupos}>↺</button>
              </div>
            </div>

            {loadingGrupos ? (
              <div className="admin-table-state">Cargando reportes agrupados…</div>
            ) : grupos.length === 0 ? (
              <div className="admin-table-state">No hay publicaciones reportadas con ese filtro.</div>
            ) : (
              <div className="ar-grupos">
                {grupos.map((g) => (
                  <GrupoPublicacion
                    key={g.grupo_key}
                    grupo={g}
                    expandido={grupoExpandido === g.grupo_key}
                    onToggle={() => toggleGrupo(g.grupo_key)}
                    onResolver={abrirResolucionGrupo}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 3: GESTIÓN DE USUARIOS (HU-45 + HU-46)
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "usuarios" && (
        <main className="admin-main" role="tabpanel" aria-label="Gestión de usuarios">
          <section className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Gestión de usuarios</h2>
                <p>
                  {totalUsuarios} usuario{totalUsuarios !== 1 ? "s" : ""} encontrado{totalUsuarios !== 1 ? "s" : ""}
                  {selectedUser && (
                    <span className="ar-selected-hint">
                      {" "}· @{selectedUser.nombre_usuario} seleccionado
                    </span>
                  )}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {estadoUsuario === "activos" && (
                  <button
                    type="button"
                    className={`ar-resolve-main-btn ar-resolve-main-btn--danger${selectedUser ? " ar-resolve-main-btn--ready" : ""}`}
                    onClick={() => {
                      if (!selectedUser) {
                        showError("Selecciona un usuario de la lista para inhabilitar.");
                        return;
                      }
                      setUserToToggle(selectedUser);
                    }}
                    aria-label={selectedUser ? `Inhabilitar a @${selectedUser.nombre_usuario}` : "Selecciona un usuario para inhabilitar"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Inhabilitar
                  </button>
                )}
                {estadoUsuario === "inhabilitados" && (
                  <button
                    type="button"
                    className={`ar-resolve-main-btn${selectedUser ? " ar-resolve-main-btn--ready" : ""}`}
                    onClick={() => {
                      if (!selectedUser) {
                        showError("Selecciona un usuario de la lista para habilitar.");
                        return;
                      }
                      setUserToToggle(selectedUser);
                    }}
                    aria-label={selectedUser ? `Habilitar a @${selectedUser.nombre_usuario}` : "Selecciona un usuario para habilitar"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17 4 12" />
                    </svg>
                    Habilitar
                  </button>
                )}
                <button
                  type="button"
                  className="admin-refresh-btn"
                  onClick={() => { loadUsers(); loadStateHistory(); }}
                  disabled={loadingUsers}
                  aria-label="Actualizar listado de usuarios"
                >
                  ↺ Actualizar
                </button>
              </div>
            </div>

            <div className="admin-filters" role="search" aria-label="Filtros de usuarios">
              <div className="admin-filter-field">
                <span id="search-label">Buscar</span>
                <input
                  type="search"
                  aria-labelledby="search-label"
                  placeholder="Nombre, usuario o correo…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPageUsuarios(1); setSelectedUser(null); }}
                />
              </div>
              <div className="admin-filter-field">
                <span id="estado-label">Estado</span>
                <select
                  aria-labelledby="estado-label"
                  value={estadoUsuario}
                  onChange={(e) => {
                    setEstadoUsuario(e.target.value as "todos" | "activos" | "inhabilitados");
                    setPageUsuarios(1);
                    setSelectedUser(null);
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inhabilitados">Inhabilitados</option>
                </select>
              </div>
              <div className="admin-filter-field">
                <span id="rol-label">Rol</span>
                <select
                  aria-labelledby="rol-label"
                  value={rol}
                  onChange={(e) => { setRol(e.target.value); setPageUsuarios(1); setSelectedUser(null); }}
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrap">
              {loadingUsers ? (
                <div className="admin-table-state">Cargando usuarios…</div>
              ) : users.length === 0 ? (
                <div className="admin-table-state">
                  No hay usuarios disponibles{search || estadoUsuario !== "todos" || rol ? " con los filtros aplicados" : ""}.
                </div>
              ) : (
                <table
                  className="admin-users-table"
                  style={{ tableLayout: "fixed" }}
                  aria-label="Listado de usuarios registrados"
                >
                  <colgroup>
                    <col style={{ width: "48px" }} />
                    <col style={{ width: "26%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "13%" }} />
                    <col style={{ width: "11%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Selección</th>
                      <th scope="col">Usuario</th>
                      <th scope="col">Rol</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Perfil</th>
                      <th scope="col">Portafolio</th>
                      <th scope="col">Fecha de creación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isSelected = selectedUser?.id_usuario === u.id_usuario;
                      const isSelf = currentUserId === u.id_usuario;
                      return (
                        <tr
                          key={u.id_usuario}
                          role="button"
                          aria-pressed={isSelected}
                          tabIndex={0}
                          className={`ar-row ar-row--selectable${isSelected ? " ar-row--selected" : ""}${isSelf ? " ar-row--self" : ""}`}
                          onClick={() => setSelectedUser(isSelected ? null : u)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedUser(isSelected ? null : u);
                            }
                          }}
                          title={isSelf ? "Tu propia cuenta" : isSelected ? "Haz clic para deseleccionar" : "Haz clic para seleccionar"}
                        >
                          <td>
                            <span
                              className={`ar-row-check${isSelected ? " ar-row-check--on" : ""}`}
                              aria-hidden="true"
                            >
                              {isSelected ? "✓" : "○"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-avatar" aria-hidden="true">
                                {u.perfil?.nombre
                                  ? u.perfil.nombre.charAt(0).toUpperCase()
                                  : u.nombre_usuario.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {u.perfil?.nombre ?? u.nombre_usuario}
                                </strong>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  @{u.nombre_usuario}
                                </span>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {u.correo}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span className="ar-motivo-chip">
                              {u.rol === "admin" ? "Administrador" : "Usuario"}
                            </span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span className={`admin-badge${u.eliminado ? " admin-badge-disabled" : " admin-badge-active"}`}>
                              {u.eliminado ? "Inhabilitado" : "Activo"}
                            </span>
                            {isSelf && (
                              <span className="admin-muted" style={{ fontSize: 11, display: "block", marginTop: 2 }}>
                                (tú)
                              </span>
                            )}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {u.perfil !== null
                              ? <span className="admin-badge admin-badge-active">Con perfil</span>
                              : <span className="admin-muted">Sin perfil</span>}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {u.portafolio !== null
                              ? u.portafolio.publicado
                                ? <span className="admin-badge admin-badge-active">Publicado</span>
                                : <span className="ar-badge ar-badge--pending">No publicado</span>
                              : <span className="admin-muted">Sin portafolio</span>}
                          </td>
                          <td className="admin-muted" style={{ whiteSpace: "nowrap" }}>
                            {u.creado_en
                              ? new Date(u.creado_en).toLocaleDateString("es", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {lastPageUsuarios > 1 && (
              <div className="admin-pagination">
                <button
                  type="button"
                  onClick={() => { setPageUsuarios((c) => Math.max(1, c - 1)); setSelectedUser(null); }}
                  disabled={pageUsuarios <= 1 || loadingUsers}
                >
                  ← Anterior
                </button>
                <span>Página {pageUsuarios} de {lastPageUsuarios}</span>
                <button
                  type="button"
                  onClick={() => { setPageUsuarios((c) => Math.min(lastPageUsuarios, c + 1)); setSelectedUser(null); }}
                  disabled={pageUsuarios >= lastPageUsuarios || loadingUsers}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </section>

          <section className="admin-section" style={{ marginTop: 20 }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--admin-text)" }}>
              Historial de cambios de estado
            </h2>
            {loadingHistorialEstados ? (
              <p className="admin-empty-text">Cargando historial…</p>
            ) : historialEstados.length === 0 ? (
              <p className="admin-empty-text">Aún no hay cambios de estado registrados.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {historialEstados.map((evento) => (
                  <div
                    key={evento.id_evento}
                    style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.18)", paddingBottom: 10 }}
                  >
                    <strong style={{ display: "block" }}>@{evento.nombre_usuario ?? "usuario"}</strong>
                    <span className="admin-muted" style={{ display: "block", fontSize: 12 }}>
                      {evento.accion === "inhabilitado" ? "Inhabilitado" : "Habilitado"}
                      {evento.admin_nombre_usuario ? ` por @${evento.admin_nombre_usuario}` : ""}
                    </span>
                    <span className="admin-muted" style={{ display: "block", fontSize: 12 }}>
                      {new Date(evento.creado_en).toLocaleDateString("es", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                      {evento.reporte_id ? ` · reporte #${evento.reporte_id}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 4: SOLICITUDES DE REACTIVACIÓN (HU-95 CAs 11–18)
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "reactivaciones" && (
        <div className="ar-layout" role="tabpanel">
          <main className="ar-main">
            <div className="ar-section-head">
              <div>
                <h2 className="ar-section-title">Solicitudes de reactivación</h2>
                <p className="ar-section-subtitle">
                  {/* CA18: si no hay solicitudes, se muestra en panel derecho */}
                  {totalSolicitudes} solicitud{totalSolicitudes !== 1 ? "es" : ""} encontrada{totalSolicitudes !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="ar-filters">
                {(["pendiente", "aceptada", "rechazada", "todos"] as const).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setFiltroSolicitud(e)}
                    className={`ar-filter-btn${filtroSolicitud === e ? " ar-filter-btn--active" : ""}`}
                  >
                    {e === "todos" ? "Todos" : capitalize(e)}
                  </button>
                ))}
              </div>
            </div>

            {/* CA12: lista de solicitudes */}
            <div className="admin-table-wrap">
              {loadingSolicitudes ? (
                <div className="admin-table-state">Cargando solicitudes…</div>
              ) : solicitudes.length === 0 ? (
                /* CA18: sin solicitudes pendientes */
                <div className="admin-table-state ar-empty-reactivacion">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p>No hay mensajes por revisar{filtroSolicitud !== "todos" ? ` con estado "${filtroSolicitud}"` : ""}.</p>
                </div>
              ) : (
                <table className="admin-users-table ar-table" aria-label="Lista de solicitudes de reactivación">
                  <thead>
                    <tr>
                      <th scope="col">Usuario</th>
                      <th scope="col">Correo</th>
                      <th scope="col">Mensaje (resumen)</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((s) => {
                      const activa = solicitudActiva?.id_solicitud === s.id_solicitud;
                      return (
                        <tr
                          key={s.id_solicitud}
                          role="button"
                          tabIndex={0}
                          aria-pressed={activa}
                          className={`ar-row ar-row--selectable${activa ? " ar-row--selected" : ""}`}
                          onClick={() => setSolicitudActiva(activa ? null : s)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSolicitudActiva(activa ? null : s);
                            }
                          }}
                        >
                          <td>
                            <div className="ar-user-cell">
                              <div className="ar-user-initials">
                                {(s.nombre_completo ?? s.nombre_usuario).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{s.nombre_completo ?? s.nombre_usuario}</strong>
                                <span>@{s.nombre_usuario}</span>
                              </div>
                            </div>
                          </td>
                          <td className="admin-muted" style={{ fontSize: 12 }}>{s.correo}</td>
                          <td>
                            <span style={{ color: "var(--admin-text-muted)", fontSize: 13 }}>
                              {s.mensaje.length > 60 ? `${s.mensaje.slice(0, 60)}…` : s.mensaje}
                            </span>
                          </td>
                          <td className="ar-fecha">
                            {new Date(s.creado_en).toLocaleDateString("es", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td><SolicitudBadge estado={s.estado} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {lastPageSolicitudes > 1 && (
              <div className="admin-pagination">
                <button type="button" onClick={() => setPageSolicitudes((p) => Math.max(1, p - 1))}
                  disabled={pageSolicitudes <= 1 || loadingSolicitudes}>← Anterior</button>
                <span>Página {pageSolicitudes} de {lastPageSolicitudes}</span>
                <button type="button" onClick={() => setPageSolicitudes((p) => Math.min(lastPageSolicitudes, p + 1))}
                  disabled={pageSolicitudes >= lastPageSolicitudes || loadingSolicitudes}>Siguiente →</button>
              </div>
            )}
          </main>

          {/* Panel de detalle: CA13/CA14 */}
          <aside className="ar-preview" aria-label="Detalle de solicitud de reactivación">
            {!solicitudActiva ? (
              <div className="ar-preview-empty">
                <div className="ar-preview-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p>Selecciona una solicitud<br />para ver la explicación del usuario</p>
              </div>
            ) : (
              <DetalleSolicitud
                solicitud={solicitudActiva}
                onClose={() => setSolicitudActiva(null)}
                onResolver={resolverSolicitud}
                resolviendo={resolviendoSolicitud}
              />
            )}
          </aside>
        </div>
      )}

      {/* ── Modal: Resolver conflicto (Tab 1 — HU-95) ── */}
      {modalResolucionAbierto && reporteSeleccionado && (
        <div
          className="ar-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !resolviendo) setModalResolucionAbierto(false); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-resolver-title"
        >
          <div className="ar-modal">
            <div className="ar-modal-header">
              <h3 className="ar-modal-title" id="modal-resolver-title">Resolver conflicto</h3>
              <button type="button" className="ar-preview-close"
                onClick={() => setModalResolucionAbierto(false)} disabled={resolviendo} aria-label="Cerrar">✕</button>
            </div>
            <div className="ar-modal-body">
              <div className="ar-modal-reporte-info">
                <div className="ar-user-initials">{reporteSeleccionado.nombre_reportado.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{reporteSeleccionado.nombre_reportado}</strong>
                  <span className="admin-muted"> @{reporteSeleccionado.nombre_usuario_reportado}</span>
                  <span className="ar-motivo-chip" style={{ marginLeft: 8 }}>
                    {MOTIVO_LABELS[reporteSeleccionado.motivo] ?? reporteSeleccionado.motivo}
                  </span>
                </div>
              </div>

              {/* CA6: opciones inhabilitar / desestimar */}
              <div className="ar-modal-field">
                <label className="ar-modal-label">Acción a tomar</label>
                <div className="ar-modal-radio-group">
                  <button
                    type="button"
                    className={`ar-modal-choice${accionResolucion === "inhabilitar" ? " ar-modal-choice--danger" : ""}`}
                    onClick={() => setAccionResolucion("inhabilitar")}
                    aria-pressed={accionResolucion === "inhabilitar"}
                  >
                    {reporteSeleccionado.eliminado ? "🔓 Habilitar cuenta" : "🚫 Inhabilitar cuenta"}
                  </button>
                  <button
                    type="button"
                    className={`ar-modal-choice${accionResolucion === "desestimar" ? " ar-modal-choice--accent" : ""}`}
                    onClick={() => setAccionResolucion("desestimar")}
                    aria-pressed={accionResolucion === "desestimar"}
                  >
                    ✕ Desestimar reporte
                  </button>
                </div>
              </div>

              {/* CA8/CA9: comentario obligatorio para desestimar */}
              {accionResolucion === "desestimar" && (
                <div className="ar-modal-field">
                  <label className="ar-modal-label" htmlFor="comentario-desestimar">
                    Comentario <span className="ar-modal-required">*obligatorio</span>
                  </label>
                  <textarea
                    id="comentario-desestimar"
                    ref={comentarioRef}
                    className={`ar-modal-textarea${comentarioError ? " ar-modal-textarea--error" : ""}`}
                    value={comentarioDesestimar}
                    onChange={(e) => {
                      setComentarioDesestimar(e.target.value);
                      if (e.target.value.trim()) setComentarioError(false);
                    }}
                    disabled={resolviendo}
                    placeholder="Describe el motivo por el que se desestima este reporte…"
                    rows={3}
                    aria-required="true"
                    aria-invalid={comentarioError}
                    aria-describedby={comentarioError ? "comentario-error" : undefined}
                  />
                  {comentarioError && (
                    <p id="comentario-error" className="ar-field-error" role="alert">
                      El comentario es obligatorio para desestimar un reporte.
                    </p>
                  )}
                </div>
              )}

              {accionResolucion === "inhabilitar" && (
                <div className="ar-modal-field">
                  <p className="ar-modal-desc" style={{ margin: 0 }}>
                    Se {reporteSeleccionado.eliminado ? "habilitará" : "inhabilitará"} la cuenta de{" "}
                    <strong>@{reporteSeleccionado.nombre_usuario_reportado}</strong> y el reporte quedará marcado
                    como revisado.
                  </p>
                </div>
              )}
            </div>
            <div className="ar-modal-footer">
              <button type="button" className="ar-btn ar-btn--cancel"
                onClick={() => setModalResolucionAbierto(false)} disabled={resolviendo}>Cancelar</button>
              <button
                type="button"
                className={`ar-btn${accionResolucion === "inhabilitar" ? " ar-btn--resolve" : " ar-btn--dismiss"}`}
                onClick={confirmarResolucionHU95}
                disabled={resolviendo || !accionResolucion}
              >
                {resolviendo ? "Guardando…" : "Confirmar resolución"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Resolver desde "Por publicación" (Tab 2) ── */}
      {modalGrupoAbierto && reporteSeleccionadoGrupo && (
        <div
          className="ar-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !resolviendoGrupo) setModalGrupoAbierto(false); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-grupo-title"
        >
          <div className="ar-modal">
            <div className="ar-modal-header">
              <h3 className="ar-modal-title" id="modal-grupo-title">Resolver conflicto</h3>
              <button type="button" className="ar-preview-close"
                onClick={() => setModalGrupoAbierto(false)} disabled={resolviendoGrupo} aria-label="Cerrar">✕</button>
            </div>
            <div className="ar-modal-body">
              <div className="ar-modal-reporte-info">
                <div className="ar-user-initials">{reporteSeleccionadoGrupo.nombre_reportado.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{reporteSeleccionadoGrupo.nombre_reportado}</strong>
                  <span className="admin-muted"> @{reporteSeleccionadoGrupo.nombre_usuario_reportado}</span>
                </div>
              </div>
              <div className="ar-modal-field">
                <label className="ar-modal-label">Acción</label>
                <div className="ar-modal-radio-group">
                  <button type="button"
                    className={`ar-modal-choice${accionGrupo === "inhabilitar" ? " ar-modal-choice--danger" : ""}`}
                    onClick={() => setAccionGrupo("inhabilitar")}
                    aria-pressed={accionGrupo === "inhabilitar"}>
                    {reporteSeleccionadoGrupo.eliminado ? "🔓 Habilitar cuenta" : "🚫 Inhabilitar cuenta"}
                  </button>
                  <button type="button"
                    className={`ar-modal-choice${accionGrupo === "desestimar" ? " ar-modal-choice--accent" : ""}`}
                    onClick={() => setAccionGrupo("desestimar")}
                    aria-pressed={accionGrupo === "desestimar"}>
                    ✕ Desestimar reporte
                  </button>
                </div>
              </div>
              {accionGrupo === "desestimar" && (
                <div className="ar-modal-field">
                  <label className="ar-modal-label" htmlFor="comentario-grupo">
                    Comentario <span className="ar-modal-required">*obligatorio</span>
                  </label>
                  <textarea id="comentario-grupo" ref={comentarioGrupoRef}
                    className={`ar-modal-textarea${comentarioGrupoError ? " ar-modal-textarea--error" : ""}`}
                    value={comentarioGrupo}
                    onChange={(e) => { setComentarioGrupo(e.target.value); if (e.target.value.trim()) setComentarioGrupoError(false); }}
                    disabled={resolviendoGrupo}
                    placeholder="Describe el motivo para desestimar este reporte…"
                    rows={3}
                    aria-required="true"
                    aria-invalid={comentarioGrupoError}
                  />
                  {comentarioGrupoError && (
                    <p className="ar-field-error" role="alert">El comentario es obligatorio.</p>
                  )}
                </div>
              )}
            </div>
            <div className="ar-modal-footer">
              <button type="button" className="ar-btn ar-btn--cancel"
                onClick={() => setModalGrupoAbierto(false)} disabled={resolviendoGrupo}>Cancelar</button>
              <button type="button"
                className={`ar-btn${accionGrupo === "inhabilitar" ? " ar-btn--resolve" : " ar-btn--dismiss"}`}
                onClick={confirmarResolucionGrupo}
                disabled={resolviendoGrupo || !accionGrupo}>
                {resolviendoGrupo ? "Guardando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar habilitar/inhabilitar usuario (Tab 3) ── */}
      <ConfirmModal
        open={userToToggle !== null}
        title={userToToggle?.eliminado ? "Habilitar usuario" : "Inhabilitar usuario"}
        message={userToToggle
          ? `Vas a ${userToToggle.eliminado ? "habilitar" : "inhabilitar"} a @${userToToggle.nombre_usuario}. Esta acción cambiará su acceso al sistema.`
          : ""}
        confirmLabel={userToToggle?.eliminado ? "Habilitar" : "Inhabilitar"}
        variant="danger"
        loading={updatingUserId === userToToggle?.id_usuario}
        onConfirm={confirmToggle}
        onCancel={() => { if (updatingUserId !== null) return; setUserToToggle(null); }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Sub-componentes
// ══════════════════════════════════════════════════════════════════════════

/** Panel derecho de detalle de un reporte (HU-95 Tab 1) */
function PreviewReporteHU95({
  reporte: r,
  onClose,
  onResolver,
}: {
  reporte: ReportePortafolio;
  onClose: () => void;
  onResolver: () => void;
}) {
  return (
    <div className="ar-preview-content">
      <div className="ar-preview-header">
        <h3 className="ar-preview-title">Reporte seleccionado</h3>
        <button type="button" className="ar-preview-close" onClick={onClose} aria-label="Deseleccionar">✕</button>
      </div>

      <div className="ar-preview-section">
        <p className="ar-preview-label">Usuario reportado</p>
        <div className="ar-preview-user">
          <div className="ar-user-initials ar-user-initials--lg">
            {r.nombre_reportado.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="ar-preview-name">{r.nombre_reportado}</p>
            <p className="ar-preview-username">@{r.nombre_usuario_reportado}</p>
          </div>
        </div>
      </div>

      <div className="ar-preview-section">
        <p className="ar-preview-label">Motivo</p>
        <p className="ar-preview-value">{MOTIVO_LABELS[r.motivo] ?? r.motivo}</p>
        {r.comentario && (
          <>
            <p className="ar-preview-label" style={{ marginTop: 10 }}>Comentario del reportante</p>
            <p className="ar-preview-comment">"{r.comentario}"</p>
          </>
        )}
      </div>

      <div className="ar-preview-section ar-preview-meta">
        <div>
          <p className="ar-preview-label">Estado</p>
          <EstadoBadge estado={r.estado} />
        </div>
        <div>
          <p className="ar-preview-label">Cuenta</p>
          <span className={`admin-badge${r.eliminado ? " admin-badge-disabled" : " admin-badge-active"}`}>
            {r.eliminado ? "Inhabilitada" : "Activa"}
          </span>
        </div>
      </div>

      {r.nota_moderador && (
        <div className="ar-preview-section">
          <p className="ar-preview-label">Nota del moderador</p>
          <p className="ar-preview-comment">{r.nota_moderador}</p>
        </div>
      )}

      {r.slug_publico && (
        <div className="ar-preview-section">
          <a href={`/portafolio/publico/${r.slug_publico}`} target="_blank" rel="noreferrer"
            className="ar-view-portfolio-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Ver portafolio público
          </a>
        </div>
      )}

      {r.estado === "pendiente" && (
        <div className="ar-preview-section ar-preview-actions">
          <button type="button" className="ar-preview-btn ar-btn--resolve" onClick={onResolver}>
            Resolver conflictos
          </button>
        </div>
      )}
    </div>
  );
}

/** Panel de detalle de una solicitud de reactivación (HU-95 CAs 13–16) */
function DetalleSolicitud({
  solicitud: s,
  onClose,
  onResolver,
  resolviendo,
}: {
  solicitud: SolicitudReactivacion;
  onClose: () => void;
  onResolver: (accion: "aceptar" | "rechazar") => void;
  resolviendo: boolean;
}) {
  return (
    <div className="ar-preview-content">
      <div className="ar-preview-header">
        <h3 className="ar-preview-title">Solicitud de reactivación</h3>
        <button type="button" className="ar-preview-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <div className="ar-preview-section">
        <p className="ar-preview-label">Usuario</p>
        <div className="ar-preview-user">
          <div className="ar-user-initials ar-user-initials--lg">
            {(s.nombre_completo ?? s.nombre_usuario).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="ar-preview-name">{s.nombre_completo ?? s.nombre_usuario}</p>
            <p className="ar-preview-username">@{s.nombre_usuario}</p>
            <p className="ar-preview-username">{s.correo}</p>
          </div>
        </div>
      </div>

      {/* CA13: explicación, queja o solución propuesta por el usuario */}
      <div className="ar-preview-section">
        <p className="ar-preview-label">Mensaje del usuario</p>
        <p className="ar-preview-comment" style={{ whiteSpace: "pre-wrap" }}>{s.mensaje}</p>
      </div>

      <div className="ar-preview-section ar-preview-meta">
        <div>
          <p className="ar-preview-label">Fecha</p>
          <p className="ar-preview-value">
            {new Date(s.creado_en).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div>
          <p className="ar-preview-label">Estado</p>
          <SolicitudBadge estado={s.estado} />
        </div>
      </div>

      {s.admin_nombre_usuario && (
        <div className="ar-preview-section">
          <p className="ar-preview-label">Revisado por</p>
          <p className="ar-preview-value">@{s.admin_nombre_usuario}</p>
        </div>
      )}

      {/* CA14: aceptar o mantener inhabilitado */}
      {s.estado === "pendiente" && (
        <div className="ar-preview-section ar-preview-actions">
          {/* CA15: aceptar reactivación */}
          <button type="button" className="ar-preview-btn ar-btn--resolve"
            onClick={() => onResolver("aceptar")} disabled={resolviendo}>
            {resolviendo ? "Procesando…" : "✓ Aceptar reactivación"}
          </button>
          {/* CA16: rechazar solicitud */}
          <button type="button" className="ar-preview-btn ar-btn--dismiss"
            onClick={() => onResolver("rechazar")} disabled={resolviendo}>
            ✕ Mantener inhabilitado
          </button>
        </div>
      )}

      {s.estado !== "pendiente" && (
        <div className="ar-preview-section">
          <p className="ar-preview-label">Resolución</p>
          <p className="ar-preview-value">
            {s.estado === "aceptada" ? "✅ Cuenta reactivada" : "❌ Solicitud rechazada"}
            {s.revisado_en
              ? ` el ${new Date(s.revisado_en).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}`
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}

/** Fila expandible de un grupo de reportes por publicación */
function GrupoPublicacion({
  grupo: g,
  expandido,
  onToggle,
  onResolver,
}: {
  grupo: ReportesDePublicacion;
  expandido: boolean;
  onToggle: () => void;
  onResolver: (r: ReportePortafolio) => void;
}) {
  return (
    <article className={`ar-grupo${expandido ? " ar-grupo--open" : ""}`}>
      {/* CA4: cabecera completa clickeable como botón */}
      <button type="button" className="ar-grupo-header" onClick={onToggle}
        aria-expanded={expandido}>
        <div className="ar-user-cell">
          <div className="ar-user-initials">{g.nombre_reportado.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{g.nombre_reportado}</strong>
            <span>@{g.nombre_usuario_reportado}</span>
          </div>
        </div>
        <div className="ar-grupo-counts">
          <span className="ar-grupo-total">🚩 {g.total_reportes} reporte{g.total_reportes !== 1 ? "s" : ""}</span>
          {g.pendientes > 0 && (
            <span className="ar-badge ar-badge--pending">{g.pendientes} pendiente{g.pendientes !== 1 ? "s" : ""}</span>
          )}
          {g.revisados > 0 && (
            <span className="ar-badge ar-badge--resolved">{g.revisados} revisado{g.revisados !== 1 ? "s" : ""}</span>
          )}
          {g.desestimados > 0 && (
            <span className="ar-badge ar-badge--dismissed">{g.desestimados} desestimado{g.desestimados !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="ar-grupo-meta">
          <span className={`admin-badge${g.eliminado ? " admin-badge-disabled" : " admin-badge-active"}`}>
            {g.eliminado ? "Inhabilitado" : "Activo"}
          </span>
          {g.slug_publico && (
            <a href={`/portafolio/publico/${g.slug_publico}`} target="_blank" rel="noreferrer"
              className="ar-grupo-link" onClick={(e) => e.stopPropagation()}>
              Ver portafolio ↗
            </a>
          )}
          <span className="ar-grupo-chevron">{expandido ? "▲" : "▼"}</span>
        </div>
      </button>

      {expandido && (
        <div className="ar-grupo-body">
          <table className="admin-users-table ar-table ar-grupo-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Motivo</th>
                <th>Reportado por</th>
                <th>Comentario</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {g.reportes.map((r, idx) => (
                // CA4: cada fila del grupo también seleccionable como botón
                <tr key={r.id_reporte} className="ar-row">
                  <td className="admin-muted" style={{ fontFamily: "var(--admin-font-mono)", fontSize: 12 }}>
                    {idx + 1}
                  </td>
                  <td>
                    <span className="ar-motivo-chip">{MOTIVO_LABELS[r.motivo] ?? r.motivo}</span>
                  </td>
                  <td className="admin-muted">
                    {r.reportado_por_nombre ? `@${r.reportado_por_nombre}` : "Visitante"}
                  </td>
                  <td>
                    {r.comentario
                      ? <span className="ar-comentario-hint" title={r.comentario} style={{ cursor: "help" }}>
                          💬 {r.comentario.slice(0, 40)}{r.comentario.length > 40 ? "…" : ""}
                        </span>
                      : <span className="admin-muted">—</span>}
                  </td>
                  <td className="ar-fecha">
                    {new Date(r.creado_en).toLocaleDateString("es", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td><EstadoBadge estado={r.estado} /></td>
                  <td>
                    {r.estado === "pendiente" ? (
                      // CA5: botón en cada fila del grupo para resolver
                      <button type="button" className="ar-btn ar-btn--resolve"
                        onClick={() => onResolver(r)}>Resolver</button>
                    ) : (
                      <span className="admin-muted" style={{ fontSize: 12 }}>
                        {r.nota_moderador
                          ? <span title={r.nota_moderador} style={{ cursor: "help" }}>📝 Con nota</span>
                          : "Procesado"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: EstadoReporte }) {
  const cfg: Record<EstadoReporte, { cls: string; label: string }> = {
    pendiente:   { cls: "ar-badge--pending",   label: "Pendiente"   },
    revisado:    { cls: "ar-badge--resolved",  label: "Revisado"    },
    desestimado: { cls: "ar-badge--dismissed", label: "Desestimado" },
  };
  const { cls, label } = cfg[estado] ?? { cls: "", label: estado };
  return <span className={`ar-badge ${cls}`}>{label}</span>;
}

function SolicitudBadge({ estado }: { estado: EstadoSolicitud }) {
  const cfg: Record<EstadoSolicitud, { cls: string; label: string }> = {
    pendiente: { cls: "ar-badge--pending",   label: "Pendiente" },
    aceptada:  { cls: "ar-badge--resolved",  label: "Aceptada"  },
    rechazada: { cls: "ar-badge--dismissed", label: "Rechazada" },
  };
  const { cls, label } = cfg[estado] ?? { cls: "", label: estado };
  return <span className={`ar-badge ${cls}`}>{label}</span>;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}