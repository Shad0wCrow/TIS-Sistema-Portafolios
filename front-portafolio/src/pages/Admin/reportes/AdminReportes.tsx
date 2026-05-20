/**
 * AdminReportes.tsx
 * Ruta: /admin/reportes
 *
 * Tres tabs:
 *  1. "Reportes"        — lista individual de reportes + resolución (HU-61)
 *  2. "Por publicación" — agrupados por portafolio, con conteo y detalle
 *  3. "Usuarios"        — habilitar / inhabilitar cuentas (HU-45, HU-46)
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../../../components/ui/ConfirmModal/ConfirmModal";
import AdminUserFilters from "../components/AdminUserFilters";
import AdminUsersTable from "../components/AdminUsersTable";
import {
  getReportesPortafolios,
  getReportesPorPublicacion,
  resolverReporte,
  getAdminUsers,
  updateAdminUserStatus,
  type EstadoReporte,
  type ReportePortafolio,
  type ReportesDePublicacion,
  type AdminUser,
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
type Vista = "reportes" | "por_publicacion" | "usuarios";

export default function AdminReportes() {
  const navigate = useNavigate();

  // ── Tab activo ───────────────────────────────────────────────────────────
  const [vista, setVista] = useState<Vista>("reportes");

  // ── Toast ────────────────────────────────────────────────────────────────
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
  // TAB 1: REPORTES INDIVIDUALES
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

  useEffect(() => { setPageReportes(1); }, [filtroEstado]);

  function abrirResolucion(r: ReportePortafolio, estadoFinal: "revisado" | "desestimado") {
    setReporteParaResolver(r);
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
        setReportes((prev) => prev.filter((r) => r.id_reporte !== reporteParaResolver.id_reporte));
        setTotalReportes((t) => Math.max(0, t - 1));
      } else {
        setReportes((prev) => prev.map((r) =>
          r.id_reporte === reporteParaResolver.id_reporte ? res.reporte : r
        ));
      }

      if (reporteActivo?.id_reporte === reporteParaResolver.id_reporte) {
        setReporteActivo(res.reporte);
      }

      // Refrescar también la vista por publicación si estaba cargada
      if (grupos.length > 0) cargarGrupos();

      setReporteParaResolver(null);
    } catch (err: any) {
      showError(err?.response?.data?.message || "Error al resolver el reporte.");
      setReporteParaResolver(null);
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
  /** publicacion_id del grupo expandido (null = ninguno) */
  const [grupoExpandido, setGrupoExpandido] = useState<number | null>(null);

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

  function toggleGrupo(id: number) {
    setGrupoExpandido((prev) => (prev === id ? null : id));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TAB 3: USUARIOS (HU-45 + HU-46)
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

  async function confirmToggle() {
    if (!userToToggle) return;
    setUpdatingUserId(userToToggle.id_usuario);
    try {
      const response = await updateAdminUserStatus(userToToggle.id_usuario, !userToToggle.eliminado);
      showMessage(response.message);
      setUserToToggle(null);
      await loadUsers();
    } catch (err: any) {
      showError(err?.response?.data?.message || "No se pudo actualizar el estado.");
    } finally {
      setUpdatingUserId(null);
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
        <div className={`ar-toast${error ? " ar-toast--error" : ""}`} role="alert">
          {error || message}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="ar-tabs">
        <button
          type="button"
          className={`ar-tab${vista === "reportes" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("reportes")}
        >
          📋 Reportes individuales
          {pendientesCount !== undefined && pendientesCount > 0 && (
            <span className="ar-nav-badge">{pendientesCount}</span>
          )}
        </button>
        <button
          type="button"
          className={`ar-tab${vista === "por_publicacion" ? " ar-tab--active" : ""}`}
          onClick={() => setVista("por_publicacion")}
        >
          📊 Por publicación
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
          TAB 1: REPORTES INDIVIDUALES
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "reportes" && (
        <div className="ar-layout">
          <main className="ar-main">
            <div className="ar-section-head">
              <div>
                <h2 className="ar-section-title">Portafolios reportados</h2>
                <p className="ar-section-subtitle">
                  {totalReportes} reporte{totalReportes !== 1 ? "s" : ""} encontrado{totalReportes !== 1 ? "s" : ""}
                </p>
              </div>
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
            </div>

            <div className="admin-table-wrap">
              {loadingReportes ? (
                <div className="admin-table-state">Cargando reportes…</div>
              ) : reportes.length === 0 ? (
                <div className="admin-table-state">
                  No hay reportes{filtroEstado !== "todos" ? ` con estado "${filtroEstado}"` : ""}.
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
                        <td onClick={(e) => e.stopPropagation()}>
                          {r.estado === "pendiente" ? (
                            <div className="ar-actions">
                              <button type="button" className="ar-btn ar-btn--resolve"
                                onClick={() => abrirResolucion(r, "revisado")}>Resolver</button>
                              <button type="button" className="ar-btn ar-btn--dismiss"
                                onClick={() => abrirResolucion(r, "desestimado")}>Desestimar</button>
                            </div>
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

          {/* Panel de detalle */}
          <aside className="ar-preview">
            {!reporteActivo ? (
              <div className="ar-preview-empty">
                <div className="ar-preview-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <p>Selecciona un reporte<br />para ver los detalles</p>
              </div>
            ) : (
              <PreviewReporte
                reporte={reporteActivo}
                onClose={() => setReporteActivo(null)}
                onResolver={(ef) => abrirResolucion(reporteActivo, ef)}
              />
            )}
          </aside>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB 2: POR PUBLICACIÓN
      ════════════════════════════════════════════════════════════════════ */}
      {vista === "por_publicacion" && (
        <div className="ar-layout ar-layout--single">
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
                  onClick={cargarGrupos} disabled={loadingGrupos}>
                  ↺
                </button>
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
                    key={g.publicacion_id}
                    grupo={g}
                    expandido={grupoExpandido === g.publicacion_id}
                    onToggle={() => toggleGrupo(g.publicacion_id)}
                    onResolver={(r, ef) => abrirResolucion(r, ef)}
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
        <main className="admin-main">
          <section className="admin-section admin-users-shell">
            <div className="admin-section-header">
              <div>
                <h2>Gestión de usuarios</h2>
                <p>{totalUsuarios} usuario{totalUsuarios !== 1 ? "s" : ""} encontrado{totalUsuarios !== 1 ? "s" : ""}.</p>
              </div>
              <button type="button" className="admin-refresh-btn" onClick={loadUsers} disabled={loadingUsers}>
                ↺ Actualizar
              </button>
            </div>

            <AdminUserFilters
              search={search} estado={estadoUsuario} rol={rol}
              onSearchChange={(v) => { setSearch(v); setPageUsuarios(1); }}
              onEstadoChange={(v) => { setEstadoUsuario(v); setPageUsuarios(1); }}
              onRolChange={(v) => { setRol(v); setPageUsuarios(1); }}
            />

            <div className="admin-users-layout">
              <div className="admin-users-table-zone">
                <div className="admin-table-wrap">
                  <AdminUsersTable
                    users={users} loading={loadingUsers}
                    updatingUserId={updatingUserId} currentUserId={currentUserId}
                    onToggleStatus={(u) => setUserToToggle(u)}
                  />
                </div>
                {lastPageUsuarios > 1 && (
                  <div className="admin-pagination">
                    <button type="button"
                      onClick={() => setPageUsuarios((c) => Math.max(1, c - 1))}
                      disabled={pageUsuarios <= 1 || loadingUsers}>← Anterior</button>
                    <span>Página {pageUsuarios} de {lastPageUsuarios}</span>
                    <button type="button"
                      onClick={() => setPageUsuarios((c) => Math.min(lastPageUsuarios, c + 1))}
                      disabled={pageUsuarios >= lastPageUsuarios || loadingUsers}>Siguiente →</button>
                  </div>
                )}
              </div>
              <aside className="admin-users-sidebar">
                <article className="admin-report-card admin-users-note">
                  <h2>Habilitar / Inhabilitar cuentas</h2>
                  <p className="admin-empty-text">
                    Usa el botón en cada fila para cambiar el estado. Un modal de confirmación
                    se mostrará antes de aplicar cualquier cambio.
                  </p>
                </article>
              </aside>
            </div>
          </section>
        </main>
      )}

      {/* ── Modal: Resolución de reporte ── */}
      {reporteParaResolver && estadoFinalPendiente && (
        <div className="ar-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !resolviendo) setReporteParaResolver(null); }}>
          <div className="ar-modal">
            <div className="ar-modal-header">
              <h3 className="ar-modal-title">
                {estadoFinalPendiente === "revisado" ? "Resolver reporte" : "Desestimar reporte"}
              </h3>
              <button type="button" className="ar-preview-close"
                onClick={() => setReporteParaResolver(null)} disabled={resolviendo} aria-label="Cerrar">✕</button>
            </div>
            <div className="ar-modal-body">
              <p className="ar-modal-desc">
                {estadoFinalPendiente === "revisado"
                  ? `Marcando como revisado el reporte sobre @${reporteParaResolver.nombre_usuario_reportado}.`
                  : `Descartando el reporte sobre @${reporteParaResolver.nombre_usuario_reportado}.`}
              </p>

              {estadoFinalPendiente === "revisado" && (
                <div className="ar-modal-field">
                  <label className="ar-modal-label">Acción sobre la cuenta</label>
                  <div className="ar-modal-radio-group">
                    {[
                      { val: null, label: "Sin cambios en la cuenta", danger: false },
                      {
                        val: reporteParaResolver.eliminado ? "habilitar" : "inhabilitar",
                        label: reporteParaResolver.eliminado ? "Habilitar cuenta" : "Inhabilitar cuenta",
                        danger: !reporteParaResolver.eliminado,
                      },
                    ].map(({ val, label, danger }) => (
                      <button key={String(val)} type="button"
                        onClick={() => setAccionCuenta(val as "inhabilitar" | "habilitar" | null)}
                        className={["ar-modal-choice",
                          accionCuenta === val ? (danger ? "ar-modal-choice--danger" : "ar-modal-choice--accent") : ""
                        ].filter(Boolean).join(" ")}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="ar-modal-field">
                <label className="ar-modal-label" htmlFor="nota-mod">
                  Nota interna <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span>
                </label>
                <textarea id="nota-mod" className="ar-modal-textarea"
                  value={nota} onChange={(e) => setNota(e.target.value)}
                  disabled={resolviendo} placeholder="Describe brevemente la decisión tomada…" rows={3} />
              </div>
            </div>
            <div className="ar-modal-footer">
              <button type="button" className="ar-btn ar-btn--cancel"
                onClick={() => setReporteParaResolver(null)} disabled={resolviendo}>Cancelar</button>
              <button type="button"
                className={`ar-btn${estadoFinalPendiente === "revisado" ? " ar-btn--resolve" : " ar-btn--dismiss"}`}
                onClick={confirmarResolucion} disabled={resolviendo}>
                {resolviendo ? "Guardando…"
                  : estadoFinalPendiente === "revisado" ? "Confirmar resolución" : "Confirmar desestimación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirmar habilitar/inhabilitar usuario ── */}
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

/** Panel derecho de detalle de un reporte individual */
function PreviewReporte({
  reporte: r,
  onClose,
  onResolver,
}: {
  reporte: ReportePortafolio;
  onClose: () => void;
  onResolver: (ef: "revisado" | "desestimado") => void;
}) {
  return (
    <div className="ar-preview-content">
      <div className="ar-preview-header">
        <h3 className="ar-preview-title">Detalle del reporte</h3>
        <button type="button" className="ar-preview-close" onClick={onClose} aria-label="Cerrar">✕</button>
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
            <p className="ar-preview-label" style={{ marginTop: 10 }}>Comentario</p>
            <p className="ar-preview-comment">"{r.comentario}"</p>
          </>
        )}
      </div>

      <div className="ar-preview-section ar-preview-meta">
        <div>
          <p className="ar-preview-label">Reportado por</p>
          <p className="ar-preview-value">
            {r.reportado_por_nombre ? `@${r.reportado_por_nombre}` : "Visitante anónimo"}
          </p>
        </div>
        <div>
          <p className="ar-preview-label">Fecha</p>
          <p className="ar-preview-value">
            {new Date(r.creado_en).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
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
          <p className="ar-preview-label">Portafolio</p>
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
          <button type="button" className="ar-preview-btn ar-btn--resolve"
            onClick={() => onResolver("revisado")}>Marcar como revisado</button>
          <button type="button" className="ar-preview-btn ar-btn--dismiss"
            onClick={() => onResolver("desestimado")}>Desestimar reporte</button>
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
  onResolver: (r: ReportePortafolio, ef: "revisado" | "desestimado") => void;
}) {
  return (
    <article className={`ar-grupo${expandido ? " ar-grupo--open" : ""}`}>
      {/* Cabecera del grupo */}
      <button type="button" className="ar-grupo-header" onClick={onToggle}>
        <div className="ar-user-cell">
          <div className="ar-user-initials">{g.nombre_reportado.charAt(0).toUpperCase()}</div>
          <div>
            <strong>{g.nombre_reportado}</strong>
            <span>@{g.nombre_usuario_reportado}</span>
          </div>
        </div>

        {/* Contadores */}
        <div className="ar-grupo-counts">
          <span className="ar-grupo-total" title="Total de reportes">
            🚩 {g.total_reportes} reporte{g.total_reportes !== 1 ? "s" : ""}
          </span>
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

      {/* Detalle expandido: lista de todos los reportes */}
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
                      ? <span className="ar-comentario-hint" title={r.comentario} style={{ cursor: "help" }}>💬 {r.comentario.slice(0, 40)}{r.comentario.length > 40 ? "…" : ""}</span>
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
                      <div className="ar-actions">
                        <button type="button" className="ar-btn ar-btn--resolve"
                          onClick={() => onResolver(r, "revisado")}>Resolver</button>
                        <button type="button" className="ar-btn ar-btn--dismiss"
                          onClick={() => onResolver(r, "desestimado")}>Desestimar</button>
                      </div>
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

// ── Helpers ──────────────────────────────────────────────────────────────

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