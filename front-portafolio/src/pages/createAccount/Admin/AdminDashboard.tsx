import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getReportesPortafolios,
  resolverReporte,
  type EstadoReporte,
  type ReportePortafolio,
} from "../../services/adminService";
import "./AdminDashboard.css";
import "./AdminReportes.css";

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

export default function AdminReportes() {
  const navigate = useNavigate();

  const [reportes, setReportes] = useState<ReportePortafolio[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | "todos">("pendiente");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Panel lateral de vista previa
  const [reporteActivo, setReporteActivo] = useState<ReportePortafolio | null>(null);

  // Modal de resolución
  const [reporteParaResolver, setReporteParaResolver] = useState<ReportePortafolio | null>(null);
  const [accionCuenta, setAccionCuenta] = useState<"inhabilitar" | "habilitar" | null>(null);
  const [nota, setNota] = useState("");
  const [estadoFinalPendiente, setEstadoFinalPendiente] = useState<"revisado" | "desestimado" | null>(null);
  const [resolviendo, setResolviendo] = useState(false);

  const cargarReportes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReportesPortafolios({ estado: filtroEstado, page, per_page: PER_PAGE });
      setReportes(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch {
      setError("No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, page]);

  useEffect(() => { cargarReportes(); }, [cargarReportes]);
  useEffect(() => { setPage(1); }, [filtroEstado]);

  function handleLogout() {
    ["token", "user", "hasProfile", "hasPortafolio"].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem("dashboardPortafoliosCache");
    navigate("/login");
  }

  function abrirResolucion(reporte: ReportePortafolio, estadoFinal: "revisado" | "desestimado") {
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

      setMessage(res.message);
      setTimeout(() => setMessage(null), 3500);

      // Actualizar lista
      if (filtroEstado === "pendiente") {
        setReportes((prev) => prev.filter((r) => r.id_reporte !== reporteParaResolver.id_reporte));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        setReportes((prev) =>
          prev.map((r) => (r.id_reporte === reporteParaResolver.id_reporte ? res.reporte : r))
        );
      }

      // Actualizar panel lateral si era el activo
      if (reporteActivo?.id_reporte === reporteParaResolver.id_reporte) {
        setReporteActivo(res.reporte);
      }

      setReporteParaResolver(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al resolver el reporte.");
      setReporteParaResolver(null);
    } finally {
      setResolviendo(false);
    }
  }

  const pendientesCount = filtroEstado === "pendiente" ? total : undefined;

  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Devfolio</span>
          <h1>Panel administrativo</h1>
        </div>
        <nav className="ar-nav">
          <a href="/admin" className="ar-nav-link">
            Usuarios
          </a>
          <span className="ar-nav-link ar-nav-link--active">
            Reportes
            {pendientesCount !== undefined && pendientesCount > 0 && (
              <span className="ar-nav-badge">{pendientesCount}</span>
            )}
          </span>
        </nav>
        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </header>

      {/* ── Mensajes ── */}
      {(message || error) && (
        <div className={`ar-toast ${error ? "ar-toast--error" : ""}`} role="alert">
          {error || message}
        </div>
      )}

      {/* ── Layout principal ── */}
      <div className="ar-layout">
        {/* ── Panel izquierdo: tabla ── */}
        <main className="ar-main">
          {/* Cabecera de sección */}
          <div className="ar-section-head">
            <div>
              <h2 className="ar-section-title">Portafolios reportados</h2>
              <p className="ar-section-subtitle">{total} reporte{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</p>
            </div>
            <div className="ar-filters">
              {(["todos", "pendiente", "revisado", "desestimado"] as const).map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setFiltroEstado(e)}
                  className={`ar-filter-btn ${filtroEstado === e ? "ar-filter-btn--active" : ""}`}
                >
                  {e === "todos" ? "Todos" : capitalize(e)}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <div className="admin-table-wrap">
            {loading ? (
              <div className="admin-table-state">Cargando reportes…</div>
            ) : reportes.length === 0 ? (
              <div className="admin-table-state">
                No hay reportes {filtroEstado !== "todos" ? `con estado "${filtroEstado}"` : ""}.
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
                      className={`ar-row ${reporteActivo?.id_reporte === r.id_reporte ? "ar-row--active" : ""}`}
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
                          <span className="ar-comentario-hint" title={r.comentario}>💬</span>
                        )}
                      </td>
                      <td className="admin-muted">
                        {r.reportado_por_nombre ? `@${r.reportado_por_nombre}` : "Visitante"}
                      </td>
                      <td className="admin-muted ar-fecha">
                        {new Date(r.creado_en).toLocaleDateString("es", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className={`admin-badge ${r.eliminado ? "admin-badge-disabled" : "admin-badge-active"}`}>
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
                              onClick={() => abrirResolucion(r, "revisado")}
                            >
                              Resolver
                            </button>
                            <button
                              type="button"
                              className="ar-btn ar-btn--dismiss"
                              onClick={() => abrirResolucion(r, "desestimado")}
                            >
                              Desestimar
                            </button>
                          </div>
                        ) : (
                          <span className="admin-muted" style={{ fontSize: 12 }}>
                            {r.nota_moderador ? (
                              <span title={r.nota_moderador} style={{ cursor: "help" }}>📝 Con nota</span>
                            ) : "Procesado"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginación */}
          {lastPage > 1 && (
            <div className="admin-pagination">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Anterior
              </button>
              <span>Página {page} de {lastPage}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage}>
                Siguiente
              </button>
            </div>
          )}
        </main>

        {/* ── Panel lateral: vista previa ── */}
        <aside className={`ar-preview ${reporteActivo ? "ar-preview--open" : ""}`}>
          {!reporteActivo ? (
            <div className="ar-preview-empty">
              <div className="ar-preview-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <p>Selecciona un reporte<br/>para ver los detalles</p>
            </div>
          ) : (
            <div className="ar-preview-content">
              {/* Cabecera del panel */}
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

              {/* Info del usuario reportado */}
              <div className="ar-preview-section">
                <p className="ar-preview-label">Usuario reportado</p>
                <div className="ar-preview-user">
                  <div className="ar-user-initials ar-user-initials--lg">
                    {reporteActivo.nombre_reportado.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong className="ar-preview-name">{reporteActivo.nombre_reportado}</strong>
                    <span className="ar-preview-username">@{reporteActivo.nombre_usuario_reportado}</span>
                  </div>
                </div>
              </div>

              {/* Info del reporte */}
              <div className="ar-preview-section">
                <p className="ar-preview-label">Motivo</p>
                <p className="ar-preview-value">
                  {MOTIVO_LABELS[reporteActivo.motivo] ?? reporteActivo.motivo}
                </p>
                {reporteActivo.comentario && (
                  <>
                    <p className="ar-preview-label" style={{ marginTop: 10 }}>Comentario del denunciante</p>
                    <p className="ar-preview-comment">"{reporteActivo.comentario}"</p>
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
                    {new Date(reporteActivo.creado_en).toLocaleDateString("es", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Estado */}
              <div className="ar-preview-section ar-preview-meta">
                <div>
                  <p className="ar-preview-label">Estado del reporte</p>
                  <EstadoBadge estado={reporteActivo.estado} />
                </div>
                <div>
                  <p className="ar-preview-label">Cuenta</p>
                  <span className={`admin-badge ${reporteActivo.eliminado ? "admin-badge-disabled" : "admin-badge-active"}`}>
                    {reporteActivo.eliminado ? "Inhabilitada" : "Activa"}
                  </span>
                </div>
              </div>

              {/* Nota del moderador */}
              {reporteActivo.nota_moderador && (
                <div className="ar-preview-section">
                  <p className="ar-preview-label">Nota del moderador</p>
                  <p className="ar-preview-comment">{reporteActivo.nota_moderador}</p>
                </div>
              )}

              {/* ── Ver portafolio ── */}
              {reporteActivo.slug_publico && (
                <div className="ar-preview-section">
                  <p className="ar-preview-label">Portafolio reportado</p>
                  <a
                    href={`/portafolio/publico/${reporteActivo.slug_publico}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ar-view-portfolio-btn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Ver portafolio público
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: "auto" }}>
                      <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                    </svg>
                  </a>
                </div>
              )}

              {/* Acciones (solo si pendiente) */}
              {reporteActivo.estado === "pendiente" && (
                <div className="ar-preview-section ar-preview-actions">
                  <button
                    type="button"
                    className="ar-preview-btn ar-preview-btn--resolve"
                    onClick={() => abrirResolucion(reporteActivo, "revisado")}
                  >
                    Marcar como revisado
                  </button>
                  <button
                    type="button"
                    className="ar-preview-btn ar-preview-btn--dismiss"
                    onClick={() => abrirResolucion(reporteActivo, "desestimado")}
                  >
                    Desestimar reporte
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* ── Modal de confirmación de resolución ── */}
      {reporteParaResolver && estadoFinalPendiente && (
        <div
          className="ar-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget && !resolviendo) setReporteParaResolver(null); }}
        >
          <div className="ar-modal">
            <div className="ar-modal-header">
              <h3 className="ar-modal-title">
                {estadoFinalPendiente === "revisado" ? "Resolver reporte" : "Desestimar reporte"}
              </h3>
              <button
                type="button"
                className="ar-preview-close"
                onClick={() => setReporteParaResolver(null)}
                disabled={resolviendo}
              >
                ✕
              </button>
            </div>

            <div className="ar-modal-body">
              <p className="ar-modal-desc">
                {estadoFinalPendiente === "revisado"
                  ? `Estás marcando como revisado el reporte sobre el portafolio de @${reporteParaResolver.nombre_usuario_reportado}.`
                  : `Estás descartando el reporte sobre el portafolio de @${reporteParaResolver.nombre_usuario_reportado}.`}
              </p>

              {/* Acción sobre la cuenta — solo al resolver */}
              {estadoFinalPendiente === "revisado" && (
                <div className="ar-modal-field">
                  <label className="ar-modal-label">Acción sobre la cuenta</label>
                  <div className="ar-modal-radio-group">
                    {[
                      { val: null, label: "Sin cambios en la cuenta" },
                      {
                        val: reporteParaResolver.eliminado ? "habilitar" : "inhabilitar",
                        label: reporteParaResolver.eliminado ? "Habilitar cuenta" : "Inhabilitar cuenta",
                        danger: !reporteParaResolver.eliminado,
                      },
                    ].map(({ val, label, danger }) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setAccionCuenta(val as any)}
                        className={`ar-modal-choice ${accionCuenta === val ? (danger ? "ar-modal-choice--danger" : "ar-modal-choice--accent") : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nota interna */}
              <div className="ar-modal-field">
                <label className="ar-modal-label" htmlFor="nota-mod">
                  Nota interna <span style={{ fontWeight: 400, textTransform: "none" }}>(opcional)</span>
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
                className={`ar-btn ${estadoFinalPendiente === "revisado" ? "ar-btn--resolve" : "ar-btn--dismiss"}`}
                onClick={confirmarResolucion}
                disabled={resolviendo}
              >
                {resolviendo ? "Guardando…" : estadoFinalPendiente === "revisado" ? "Confirmar resolución" : "Confirmar desestimación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EstadoBadge({ estado }: { estado: EstadoReporte }) {
  const cfg = {
    pendiente:   { cls: "ar-badge--pending",    label: "Pendiente"    },
    revisado:    { cls: "ar-badge--resolved",   label: "Revisado"     },
    desestimado: { cls: "ar-badge--dismissed",  label: "Desestimado"  },
  }[estado] ?? { cls: "", label: estado };

  return <span className={`ar-badge ${cfg.cls}`}>{cfg.label}</span>;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}