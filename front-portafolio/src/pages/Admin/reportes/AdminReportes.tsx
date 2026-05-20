/**
 * AdminReportes.tsx
 * Ruta: /admin/reportes
 *
 * Página completa de gestión:
 *  - Listado y resolución de reportes de portafolios (HU-61)
 *  - Habilitar / Inhabilitar usuarios desde el panel de detalle (HU-45, HU-46)
 *  - Búsqueda y filtrado de usuarios con acciones de estado
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/ui/ConfirmModal/ConfirmModal";
import AdminUserFilters from "../components/AdminUserFilters";
import AdminUsersTable from "../components/AdminUsersTable";
import {
  getReportesPortafolios,
  resolverReporte,
  getAdminUsers,
  updateAdminUserStatus,
  type EstadoReporte,
  type ReportePortafolio,
  type AdminUser,
} from "../../../services/adminService";
import "../AdminDashboard.css";
import "../AdminReportes.css";
import "../UsuariosReportados.css";

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

type Vista = "reportes" | "usuarios";

export default function AdminReportes() {
  const navigate = useNavigate();

  // ── Vista activa (tab) ─────────────────────────────────────────────────────
  const [vista, setVista] = useState<Vista>("reportes");

  // ── Toast ──────────────────────────────────────────────────────────────────
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
  // SECCIÓN: REPORTES (HU-61)
  // ══════════════════════════════════════════════════════════════════════════
  const [reportes, setReportes] = useState<ReportePortafolio[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | "todos">("pendiente");
  const [pageReportes, setPageReportes] = useState(1);
  const [lastPageReportes, setLastPageReportes] = useState(1);
  const [totalReportes, setTotalReportes] = useState(0);
  const [loadingReportes, setLoadingReportes] = useState(true);

  const [reporteActivo, setReporteActivo] = useState<ReportePortafolio | null>(null);
  const [reporteParaResolver, setReporteParaResolver] = useState<ReportePortafolio | null>(null);
  const [accionCuenta, setAccionCuenta] = useState<"inhabilitar" | "habilitar" | null>(null);
  const [nota, setNota] = useState("");
  const [estadoFinalPendiente, setEstadoFinalPendiente] = useState<"revisado" | "desestimado" | null>(null);
  const [resolviendo, setResolviendo] = useState(false);

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

  useEffect(() => {
    setPageReportes(1);
  }, [filtroEstado]);

  function abrirResolucion(
    reporte: ReportePortafolio,
    estadoFinal: "revisado" | "desestimado"
  ) {
    setReporteParaResolver(reporte);
    setEstadoFinalPendiente(estadoFinal);
    setAccionCuenta(null);
    setNota("");
  }

  async function confirmarResolucion() {
    if (!reporteParaResolver || !estadoFinalPendiente) return;
    setResolviendo(true);
    try {
      const res = await resolverReporte(reporteParaResolver.id_reporte, {
        estado: estadoFinalPendiente,
        nota_moderador: nota.trim() || undefined,
        accion_cuenta: accionCuenta,
      });

      showMessage(res.message);

      if (filtroEstado === "pendiente") {
        setReportes((prev) =>
          prev.filter((r) => r.id_reporte !== reporteParaResolver.id_reporte)
        );
        setTotalReportes((t) => Math.max(0, t - 1));
      } else {
        setReportes((prev) =>
          prev.map((r) =>
            r.id_reporte === reporteParaResolver.id_reporte ? res.reporte : r
          )
        );
      }

      if (reporteActivo?.id_reporte === reporteParaResolver.id_reporte) {
        setReporteActivo(res.reporte);
      }

      setReporteParaResolver(null);
    } catch (err: any) {
      showError(err?.response?.data?.message || "Error al resolver el reporte.");
      setReporteParaResolver(null);
    } finally {
      setResolviendo(false);
    }
  }

  const pendientesCount =
    filtroEstado === "pendiente" ? totalReportes : undefined;

  // ══════════════════════════════════════════════════════════════════════════
  // SECCIÓN: USUARIOS (HU-45 + HU-46)
  // ══════════════════════════════════════════════════════════════════════════
  const currentUserId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return null;
      const user = JSON.parse(rawUser) as {
        id_usuario?: number;
        id?: number;
      } | null;
      return typeof user?.id_usuario === "number"
        ? user.id_usuario
        : typeof user?.id === "number"
        ? user.id
        : null;
    } catch {
      return null;
    }
  }, []);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [estadoUsuario, setEstadoUsuario] = useState<
    "todos" | "activos" | "inhabilitados"
  >("todos");
  const [rol, setRol] = useState("");
  const [pageUsuarios, setPageUsuarios] = useState(1);
  const [lastPageUsuarios, setLastPageUsuarios] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [userToToggle, setUserToToggle] = useState<AdminUser | null>(null);

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
      setLastPageUsuarios(1);
      setTotalUsuarios(0);
      showError("No se pudieron cargar los usuarios.");
    } finally {
      setLoadingUsers(false);
    }
  }, [search, estadoUsuario, rol, pageUsuarios]);

  useEffect(() => {
    if (vista === "usuarios") loadUsers();
  }, [loadUsers, vista]);

  function requestToggle(user: AdminUser) {
    setUserToToggle(user);
  }

  /**
   * HU-45: Inhabilitar cuenta / HU-46: Habilitar cuenta
   * Se invoca cuando el admin confirma el modal.
   */
  async function confirmToggle() {
    if (!userToToggle) return;
    setUpdatingUserId(userToToggle.id_usuario);
    try {
      const response = await updateAdminUserStatus(
        userToToggle.id_usuario,
        !userToToggle.eliminado
      );
      showMessage(response.message);
      setUserToToggle(null);
      await loadUsers();
    } catch (err: any) {
      showError(
        err?.response?.data?.message ||
          "No se pudo actualizar el estado del usuario."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────
  function handleLogout() {
    ["token", "user", "hasProfile", "hasPortafolio"].forEach((k) =>
      localStorage.removeItem(k)
    );
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
          <Link to="/admin" className="admin-nav-link">
            Dashboard
          </Link>
          <span className="admin-nav-link admin-nav-link--active">
            Reportes y usuarios
            {pendientesCount !== undefined && pendientesCount > 0 && (
              <span className="ar-nav-badge">{pendientesCount}</span>
            )}
          </span>
        </nav>

        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          Salir
        </button>
      </header>

      {/* ── Toast ── */}
      {(message || error) && (
        <div
          className={`ar-toast${error ? " ar-toast--error" : ""}`}
          role="alert"
        >
          {error || message}
        </div>
      )}

      {/* ── Tabs internos ── */}
      <div className="ar-tabs">
        <button
          type="button"
          className={`ar-tab${vista === "reportes" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("reportes")}
        >
          📋 Reportes de portafolios
          {pendientesCount !== undefined && pendientesCount > 0 && (
            <span className="ar-nav-badge">{pendientesCount}</span>
          )}
        </button>
        <button
          type="button"
          className={`ar-tab${vista === "usuarios" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("usuarios")}
        >
          👥 Gestión de usuarios
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: REPORTES
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "reportes" && (
        <div className="ar-layout">
          {/* Left: tabla de reportes */}
          <main className="ar-main">
            <div className="ar-section-head">
              <div>
                <h2 className="ar-section-title">Portafolios reportados</h2>
                <p className="ar-section-subtitle">
                  {totalReportes} reporte
                  {totalReportes !== 1 ? "s" : ""} encontrado
                  {totalReportes !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="ar-filters">
                {(
                  [
                    "todos",
                    "pendiente",
                    "revisado",
                    "desestimado",
                  ] as const
                ).map((e) => (
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
            </div>

            <div className="admin-table-wrap">
              {loadingReportes ? (
                <div className="admin-table-state">Cargando reportes…</div>
              ) : reportes.length === 0 ? (
                <div className="admin-table-state">
                  No hay reportes
                  {filtroEstado !== "todos"
                    ? ` con estado "${filtroEstado}"`
                    : ""}
                  .
                </div>
              ) : (
                <table className="admin-users-table ar-table">
                  <thead>
                    <tr>
                      <th>Usuario reportado</th>
                      <th>Motivo</th>
                      <th>Reportado por</th>
                      <th>Fecha</th>
                      <th>Cuenta</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportes.map((r) => (
                      <tr
                        key={r.id_reporte}
                        className={`ar-row${reporteActivo?.id_reporte === r.id_reporte ? " ar-row--active" : ""}`}
                        onClick={() => setReporteActivo(r)}
                      >
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
                          <span className="ar-motivo-chip">
                            {MOTIVO_LABELS[r.motivo] ?? r.motivo}
                          </span>
                          {r.comentario && (
                            <span
                              className="ar-comentario-hint"
                              title={r.comentario}
                            >
                              💬
                            </span>
                          )}
                        </td>
                        <td className="admin-muted">
                          {r.reportado_por_nombre
                            ? `@${r.reportado_por_nombre}`
                            : "Visitante"}
                        </td>
                        <td className="ar-fecha">
                          {new Date(r.creado_en).toLocaleDateString("es", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <span
                            className={`admin-badge${r.eliminado ? " admin-badge-disabled" : " admin-badge-active"}`}
                          >
                            {r.eliminado ? "Inhabilitado" : "Activo"}
                          </span>
                        </td>
                        <td>
                          <EstadoBadge estado={r.estado} />
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {r.estado === "pendiente" ? (
                            <div className="ar-actions">
                              <button
                                type="button"
                                className="ar-btn ar-btn--resolve"
                                onClick={() =>
                                  abrirResolucion(r, "revisado")
                                }
                              >
                                Resolver
                              </button>
                              <button
                                type="button"
                                className="ar-btn ar-btn--dismiss"
                                onClick={() =>
                                  abrirResolucion(r, "desestimado")
                                }
                              >
                                Desestimar
                              </button>
                            </div>
                          ) : (
                            <span
                              className="admin-muted"
                              style={{ fontSize: 12 }}
                            >
                              {r.nota_moderador ? (
                                <span
                                  title={r.nota_moderador}
                                  style={{ cursor: "help" }}
                                >
                                  📝 Con nota
                                </span>
                              ) : (
                                "Procesado"
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {lastPageReportes > 1 && (
              <div className="admin-pagination">
                <button
                  type="button"
                  onClick={() =>
                    setPageReportes((p) => Math.max(1, p - 1))
                  }
                  disabled={pageReportes <= 1 || loadingReportes}
                >
                  ← Anterior
                </button>
                <span>
                  Página {pageReportes} de {lastPageReportes}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPageReportes((p) =>
                      Math.min(lastPageReportes, p + 1)
                    )
                  }
                  disabled={
                    pageReportes >= lastPageReportes || loadingReportes
                  }
                >
                  Siguiente →
                </button>
              </div>
            )}
          </main>

          {/* Right: panel de detalle del reporte */}
          <aside className="ar-preview">
            {!reporteActivo ? (
              <div className="ar-preview-empty">
                <div className="ar-preview-empty-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <p>
                  Selecciona un reporte
                  <br />
                  para ver los detalles
                </p>
              </div>
            ) : (
              <div className="ar-preview-content">
                <div className="ar-preview-header">
                  <h3 className="ar-preview-title">Detalle del reporte</h3>
                  <button
                    type="button"
                    className="ar-preview-close"
                    onClick={() => setReporteActivo(null)}
                    aria-label="Cerrar panel"
                  >
                    ✕
                  </button>
                </div>

                <div className="ar-preview-section">
                  <p className="ar-preview-label">Usuario reportado</p>
                  <div className="ar-preview-user">
                    <div className="ar-user-initials ar-user-initials--lg">
                      {reporteActivo.nombre_reportado.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="ar-preview-name">
                        {reporteActivo.nombre_reportado}
                      </p>
                      <p className="ar-preview-username">
                        @{reporteActivo.nombre_usuario_reportado}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ar-preview-section">
                  <p className="ar-preview-label">Motivo</p>
                  <p className="ar-preview-value">
                    {MOTIVO_LABELS[reporteActivo.motivo] ?? reporteActivo.motivo}
                  </p>
                  {reporteActivo.comentario && (
                    <>
                      <p
                        className="ar-preview-label"
                        style={{ marginTop: 10 }}
                      >
                        Comentario del denunciante
                      </p>
                      <p className="ar-preview-comment">
                        "{reporteActivo.comentario}"
                      </p>
                    </>
                  )}
                </div>

                <div className="ar-preview-section ar-preview-meta">
                  <div>
                    <p className="ar-preview-label">Reportado por</p>
                    <p className="ar-preview-value">
                      {reporteActivo.reportado_por_nombre
                        ? `@${reporteActivo.reportado_por_nombre}`
                        : "Visitante anónimo"}
                    </p>
                  </div>
                  <div>
                    <p className="ar-preview-label">Fecha</p>
                    <p className="ar-preview-value">
                      {new Date(reporteActivo.creado_en).toLocaleDateString(
                        "es",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="ar-preview-section ar-preview-meta">
                  <div>
                    <p className="ar-preview-label">Estado del reporte</p>
                    <EstadoBadge estado={reporteActivo.estado} />
                  </div>
                  <div>
                    <p className="ar-preview-label">Cuenta</p>
                    <span
                      className={`admin-badge${reporteActivo.eliminado ? " admin-badge-disabled" : " admin-badge-active"}`}
                    >
                      {reporteActivo.eliminado ? "Inhabilitada" : "Activa"}
                    </span>
                  </div>
                </div>

                {reporteActivo.nota_moderador && (
                  <div className="ar-preview-section">
                    <p className="ar-preview-label">Nota del moderador</p>
                    <p className="ar-preview-comment">
                      {reporteActivo.nota_moderador}
                    </p>
                  </div>
                )}

                {reporteActivo.slug_publico && (
                  <div className="ar-preview-section">
                    <p className="ar-preview-label">Portafolio reportado</p>
                    <a
                      href={`/portafolio/publico/${reporteActivo.slug_publico}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ar-view-portfolio-btn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Ver portafolio público
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        style={{ marginLeft: "auto" }}
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Acciones del reporte — solo si está pendiente (HU-45 / HU-46 se activan aquí) */}
                {reporteActivo.estado === "pendiente" && (
                  <div className="ar-preview-section ar-preview-actions">
                    <button
                      type="button"
                      className="ar-preview-btn ar-btn--resolve"
                      onClick={() =>
                        abrirResolucion(reporteActivo, "revisado")
                      }
                    >
                      Marcar como revisado
                    </button>
                    <button
                      type="button"
                      className="ar-preview-btn ar-btn--dismiss"
                      onClick={() =>
                        abrirResolucion(reporteActivo, "desestimado")
                      }
                    >
                      Desestimar reporte
                    </button>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: USUARIOS (HU-45 + HU-46)
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "usuarios" && (
        <main className="admin-main">
          <section className="admin-section admin-users-shell">
            <div className="admin-section-header">
              <div>
                <h2>Gestión de usuarios</h2>
                <p>
                  {totalUsuarios} usuario
                  {totalUsuarios !== 1 ? "s" : ""} encontrado
                  {totalUsuarios !== 1 ? "s" : ""}.
                </p>
              </div>
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={loadUsers}
                disabled={loadingUsers}
              >
                ↺ Actualizar
              </button>
            </div>

            <AdminUserFilters
              search={search}
              estado={estadoUsuario}
              rol={rol}
              onSearchChange={(v) => {
                setSearch(v);
                setPageUsuarios(1);
              }}
              onEstadoChange={(v) => {
                setEstadoUsuario(v);
                setPageUsuarios(1);
              }}
              onRolChange={(v) => {
                setRol(v);
                setPageUsuarios(1);
              }}
            />

            <div className="admin-users-layout">
              <div className="admin-users-table-zone">
                <div className="admin-table-wrap">
                  {/* HU-45 y HU-46: botones Inhabilitar / Habilitar en la tabla */}
                  <AdminUsersTable
                    users={users}
                    loading={loadingUsers}
                    updatingUserId={updatingUserId}
                    currentUserId={currentUserId}
                    onToggleStatus={requestToggle}
                  />
                </div>

                {lastPageUsuarios > 1 && (
                  <div className="admin-pagination">
                    <button
                      type="button"
                      onClick={() =>
                        setPageUsuarios((c) => Math.max(1, c - 1))
                      }
                      disabled={pageUsuarios <= 1 || loadingUsers}
                    >
                      ← Anterior
                    </button>
                    <span>
                      Página {pageUsuarios} de {lastPageUsuarios}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPageUsuarios((c) =>
                          Math.min(lastPageUsuarios, c + 1)
                        )
                      }
                      disabled={
                        pageUsuarios >= lastPageUsuarios || loadingUsers
                      }
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>

              <aside className="admin-users-sidebar">
                <article className="admin-report-card admin-users-note">
                  <h2>Habilitar / Inhabilitar cuentas</h2>
                  <p className="admin-empty-text">
                    Usa el botón de acción en cada fila para cambiar el estado
                    de la cuenta. Se mostrará un modal de confirmación antes de
                    aplicar cualquier cambio (HU-45, HU-46).
                  </p>
                </article>
                <article className="admin-report-card admin-users-note">
                  <h2>Filtro por estado</h2>
                  <p className="admin-empty-text">
                    Filtra por "Inhabilitados" para revisar primero las cuentas
                    suspendidas y evaluar si deben restaurarse.
                  </p>
                </article>
              </aside>
            </div>
          </section>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: Resolución de reporte (incluye opción inhabilitar/habilitar)
          HU-45 + HU-46 cuando se resuelve desde el panel de reportes
      ══════════════════════════════════════════════════════════════════ */}
      {reporteParaResolver && estadoFinalPendiente && (
        <div
          className="ar-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !resolviendo)
              setReporteParaResolver(null);
          }}
        >
          <div className="ar-modal">
            <div className="ar-modal-header">
              <h3 className="ar-modal-title">
                {estadoFinalPendiente === "revisado"
                  ? "Resolver reporte"
                  : "Desestimar reporte"}
              </h3>
              <button
                type="button"
                className="ar-preview-close"
                onClick={() => setReporteParaResolver(null)}
                disabled={resolviendo}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="ar-modal-body">
              <p className="ar-modal-desc">
                {estadoFinalPendiente === "revisado"
                  ? `Marcando como revisado el reporte sobre @${reporteParaResolver.nombre_usuario_reportado}.`
                  : `Descartando el reporte sobre @${reporteParaResolver.nombre_usuario_reportado}.`}
              </p>

              {/* HU-45 / HU-46: acción sobre la cuenta al resolver */}
              {estadoFinalPendiente === "revisado" && (
                <div className="ar-modal-field">
                  <label className="ar-modal-label">
                    Acción sobre la cuenta (HU-45 / HU-46)
                  </label>
                  <div className="ar-modal-radio-group">
                    {[
                      {
                        val: null,
                        label: "Sin cambios en la cuenta",
                        danger: false,
                      },
                      {
                        val: reporteParaResolver.eliminado
                          ? "habilitar"
                          : "inhabilitar",
                        label: reporteParaResolver.eliminado
                          ? "Habilitar cuenta"
                          : "Inhabilitar cuenta",
                        danger: !reporteParaResolver.eliminado,
                      },
                    ].map(({ val, label, danger }) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() =>
                          setAccionCuenta(
                            val as "inhabilitar" | "habilitar" | null
                          )
                        }
                        className={[
                          "ar-modal-choice",
                          accionCuenta === val
                            ? danger
                              ? "ar-modal-choice--danger"
                              : "ar-modal-choice--accent"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="ar-modal-field">
                <label className="ar-modal-label" htmlFor="nota-mod">
                  Nota interna{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="nota-mod"
                  className="ar-modal-textarea"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  disabled={resolviendo}
                  placeholder="Describe brevemente la decisión tomada…"
                  rows={3}
                />
              </div>
            </div>

            <div className="ar-modal-footer">
              <button
                type="button"
                className="ar-btn ar-btn--cancel"
                onClick={() => setReporteParaResolver(null)}
                disabled={resolviendo}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`ar-btn${estadoFinalPendiente === "revisado" ? " ar-btn--resolve" : " ar-btn--dismiss"}`}
                onClick={confirmarResolucion}
                disabled={resolviendo}
              >
                {resolviendo
                  ? "Guardando…"
                  : estadoFinalPendiente === "revisado"
                  ? "Confirmar resolución"
                  : "Confirmar desestimación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL: Confirmar habilitar / inhabilitar desde tab Usuarios
          HU-45 criterio 1-3 / HU-46 criterio 1-3
      ══════════════════════════════════════════════════════════════════ */}
      <ConfirmModal
        open={userToToggle !== null}
        title={
          userToToggle?.eliminado
            ? "Habilitar usuario"   // HU-46
            : "Inhabilitar usuario" // HU-45
        }
        message={
          userToToggle
            ? `Vas a ${userToToggle.eliminado ? "habilitar" : "inhabilitar"} a @${userToToggle.nombre_usuario}. Esta acción cambiará su acceso al sistema.`
            : ""
        }
        confirmLabel={userToToggle?.eliminado ? "Habilitar" : "Inhabilitar"}
        variant="danger"
        loading={updatingUserId === userToToggle?.id_usuario}
        onConfirm={confirmToggle}
        onCancel={() => {
          if (updatingUserId !== null) return;
          setUserToToggle(null);
        }}
      />
    </div>
  );
}

/* ── Helpers ── */

function EstadoBadge({ estado }: { estado: EstadoReporte }) {
  const cfg: Record<EstadoReporte, { cls: string; label: string }> = {
    pendiente:   { cls: "ar-badge--pending",   label: "Pendiente"   },
    revisado:    { cls: "ar-badge--resolved",  label: "Revisado"    },
    desestimado: { cls: "ar-badge--dismissed", label: "Desestimado" },
  };
  const { cls, label } = cfg[estado] ?? { cls: "", label: estado };
  return <span className={`ar-badge ${cls}`}>{label}</span>;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}