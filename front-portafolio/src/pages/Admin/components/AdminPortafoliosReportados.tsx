import { useEffect, useState } from "react";
import {
  getReportesPortafolios,
  resolverReporte,
  type EstadoReporte,
  type ReportePortafolio,
} from "../../../services/adminService";

const MOTIVO_LABELS: Record<string, string> = {
  contenido_inapropiado: "Contenido inapropiado",
  spam: "Spam",
  perfil_falso: "Perfil falso",
  informacion_falsa: "Información falsa",
  derechos_autor: "Derechos de autor",
  acoso: "Acoso",
  otro: "Otro",
};

const PER_PAGE = 8;

export default function AdminPortafoliosReportados() {
  const [reportes, setReportes] = useState<ReportePortafolio[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | "todos">("pendiente");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado del modal de resolución
  const [reporteActivo, setReporteActivo] = useState<ReportePortafolio | null>(null);
  const [accionCuenta, setAccionCuenta] = useState<"inhabilitar" | "habilitar" | null>(null);
  const [nota, setNota] = useState("");
  const [resolviendo, setResolviendo] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    cargarReportes();
  }, [filtroEstado, page]);

  useEffect(() => {
    setPage(1);
  }, [filtroEstado]);

  async function cargarReportes() {
    setLoading(true);
    setError(null);
    try {
      const res = await getReportesPortafolios({
        estado: filtroEstado,
        page,
        per_page: PER_PAGE,
      });
      setReportes(res.data);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch {
      setError("No se pudieron cargar los reportes.");
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(reporte: ReportePortafolio) {
    setReporteActivo(reporte);
    setAccionCuenta(null);
    setNota("");
    setMensajeExito(null);
  }

  function cerrarModal() {
    if (resolviendo) return;
    setReporteActivo(null);
  }

  async function handleResolver(estadoFinal: "revisado" | "desestimado") {
    if (!reporteActivo) return;
    setResolviendo(true);
    try {
      const res = await resolverReporte(reporteActivo.id_reporte, {
        estado: estadoFinal,
        nota_moderador: nota.trim() || undefined,
        accion_cuenta: accionCuenta,
      });
      setMensajeExito(res.message);
      // Actualiza el reporte en la lista localmente
      setReportes((prev) =>
        prev.map((r) =>
          r.id_reporte === reporteActivo.id_reporte ? res.reporte : r
        )
      );
      // Si filtramos por pendiente, lo quitamos de la vista tras 1.2 s
      if (filtroEstado === "pendiente") {
        setTimeout(() => {
          setReportes((prev) => prev.filter((r) => r.id_reporte !== reporteActivo.id_reporte));
          setTotal((t) => Math.max(0, t - 1));
          cerrarModal();
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al resolver el reporte.");
      setReporteActivo(null);
    } finally {
      setResolviendo(false);
    }
  }

  const pendientes = filtroEstado === "pendiente" ? total : undefined;

  return (
    <section className="admin-section" style={{ marginTop: 24 }}>
      {/* Cabecera */}
      <div className="admin-section-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            Portafolios reportados
            {pendientes !== undefined && pendientes > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                minWidth: 22, height: 22, borderRadius: 999,
                background: "#a33c20", color: "#fff",
                fontSize: 11, fontWeight: 800, padding: "0 6px",
              }}>
                {pendientes}
              </span>
            )}
          </h2>
          <p>{total} reportes encontrados</p>
        </div>

        {/* Filtro de estado */}
        <div style={{ display: "flex", gap: 8 }}>
          {(["todos", "pendiente", "revisado", "desestimado"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setFiltroEstado(e)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: filtroEstado === e
                  ? "1.5px solid var(--admin-accent)"
                  : "1.5px solid var(--admin-border)",
                background: filtroEstado === e ? "var(--admin-accent-soft)" : "transparent",
                color: filtroEstado === e ? "var(--admin-accent)" : "var(--admin-text-muted)",
                fontWeight: filtroEstado === e ? 700 : 500,
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {e === "todos" ? "Todos" : e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="admin-alert admin-alert-error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* Tabla */}
      <div style={{
        background: "var(--admin-surface)",
        border: "1px solid var(--admin-border)",
        borderRadius: 8,
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: 14 }}>
            Cargando reportes…
          </div>
        ) : reportes.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--admin-text-muted)", fontSize: 14 }}>
            No hay reportes {filtroEstado !== "todos" ? `con estado "${filtroEstado}"` : ""}.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-surface-muted)" }}>
                {["Usuario reportado", "Motivo", "Fecha", "Estado cuenta", "Estado reporte", ""].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontWeight: 700, fontSize: 11, textTransform: "uppercase",
                    letterSpacing: "0.05em", color: "var(--admin-text-muted)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => (
                <tr
                  key={r.id_reporte}
                  style={{
                    borderBottom: "1px solid var(--admin-border)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--admin-surface-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <strong style={{ display: "block", color: "var(--admin-text)" }}>
                      {r.nombre_reportado}
                    </strong>
                    <span style={{ color: "var(--admin-text-muted)", fontSize: 12 }}>
                      @{r.nombre_usuario_reportado}
                    </span>
                    {r.slug_publico && (
                      <a
                        href={`/portafolio/publico/${r.slug_publico}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "block", fontSize: 11, color: "var(--admin-accent)", marginTop: 2 }}
                      >
                        Ver portafolio ↗
                      </a>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--admin-text)" }}>
                    {MOTIVO_LABELS[r.motivo] ?? r.motivo}
                    {r.comentario && (
                      <span
                        title={r.comentario}
                        style={{
                          display: "inline-block", marginLeft: 6,
                          color: "var(--admin-text-muted)", cursor: "help", fontSize: 12,
                        }}
                      >
                        💬
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--admin-text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(r.creado_en).toLocaleDateString("es", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className={`admin-badge ${r.eliminado ? "admin-badge-disabled" : "admin-badge-active"}`}>
                      {r.eliminado ? "Inhabilitado" : "Activo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <EstadoBadge estado={r.estado} />
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {r.estado === "pendiente" && (
                      <button
                        type="button"
                        onClick={() => abrirModal(r)}
                        style={{
                          padding: "6px 14px", borderRadius: 6,
                          border: "1.5px solid var(--admin-accent)",
                          background: "transparent", color: "var(--admin-accent)",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "var(--admin-accent-soft)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        Revisar
                      </button>
                    )}
                    {r.estado !== "pendiente" && r.nota_moderador && (
                      <span
                        title={`Nota: ${r.nota_moderador}`}
                        style={{ color: "var(--admin-text-muted)", fontSize: 12, cursor: "help" }}
                      >
                        📝 Nota
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

      {/* Modal de revisión */}
      {reporteActivo && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
            background: "rgba(10,20,15,0.52)",
            backdropFilter: "blur(5px)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
        >
          <div style={{
            width: "100%", maxWidth: 500,
            background: "#fff", borderRadius: 14,
            border: "1px solid var(--admin-border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            overflow: "hidden",
            animation: "modalIn 0.2s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {/* Header modal */}
            <div style={{
              padding: "18px 20px 14px",
              borderBottom: "1px solid var(--admin-border)",
              display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--admin-text)" }}>
                  Revisar reporte
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--admin-text-muted)" }}>
                  Portafolio de <strong>{reporteActivo.nombre_usuario_reportado}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                disabled={resolviendo}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: "transparent", color: "var(--admin-text-muted)",
                  cursor: "pointer", fontSize: 18, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body modal */}
            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Detalle del reporte */}
              <div style={{
                padding: "12px 14px", borderRadius: 8,
                background: "var(--admin-surface-muted)",
                border: "1px solid var(--admin-border)",
                fontSize: 13,
              }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <span><strong>Motivo:</strong> {MOTIVO_LABELS[reporteActivo.motivo] ?? reporteActivo.motivo}</span>
                  <span style={{ color: "var(--admin-text-muted)" }}>
                    {new Date(reporteActivo.creado_en).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>
                {reporteActivo.comentario && (
                  <p style={{ margin: 0, color: "var(--admin-text-muted)", fontStyle: "italic" }}>
                    "{reporteActivo.comentario}"
                  </p>
                )}
              </div>

              {/* Acción sobre la cuenta */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Acción sobre la cuenta
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { val: null, label: "Sin cambios en la cuenta" },
                    {
                      val: reporteActivo.eliminado ? "habilitar" : "inhabilitar",
                      label: reporteActivo.eliminado ? "Habilitar cuenta" : "Inhabilitar cuenta",
                      danger: !reporteActivo.eliminado,
                    },
                  ].map(({ val, label, danger }) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setAccionCuenta(val as any)}
                      style={{
                        padding: "8px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.14s",
                        border: accionCuenta === val
                          ? `1.5px solid ${danger ? "var(--admin-danger)" : "var(--admin-accent)"}`
                          : "1.5px solid var(--admin-border)",
                        background: accionCuenta === val
                          ? (danger ? "var(--admin-danger-soft)" : "var(--admin-accent-soft)")
                          : "transparent",
                        color: accionCuenta === val
                          ? (danger ? "var(--admin-danger)" : "var(--admin-accent)")
                          : "var(--admin-text-muted)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nota moderador */}
              <div>
                <label
                  htmlFor="nota-moderador"
                  style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  Nota interna <span style={{ fontWeight: 400, textTransform: "none" }}>(opcional)</span>
                </label>
                <textarea
                  id="nota-moderador"
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  disabled={resolviendo}
                  placeholder="Describe brevemente la decisión tomada…"
                  rows={3}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8,
                    border: "1.5px solid var(--admin-border)",
                    background: "var(--admin-surface-muted)",
                    fontSize: 13, fontFamily: "inherit", resize: "vertical",
                    color: "var(--admin-text)", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Mensaje de éxito */}
              {mensajeExito && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "#f0fdf4", border: "1px solid #b8deca",
                  color: "var(--admin-accent)", fontSize: 13, fontWeight: 600,
                }}>
                  ✓ {mensajeExito}
                </div>
              )}

              {/* Botones de resolución */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={resolviendo}
                  style={{
                    padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: "1.5px solid var(--admin-border)", background: "#fff", color: "var(--admin-text)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleResolver("desestimado")}
                  disabled={resolviendo}
                  style={{
                    padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: "1.5px solid var(--admin-border)", background: "#fff",
                    color: "var(--admin-text-muted)",
                    opacity: resolviendo ? 0.6 : 1,
                  }}
                >
                  Desestimar
                </button>
                <button
                  type="button"
                  onClick={() => handleResolver("revisado")}
                  disabled={resolviendo}
                  style={{
                    padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    border: "none", background: "var(--admin-accent)", color: "#fff",
                    display: "flex", alignItems: "center", gap: 8,
                    opacity: resolviendo ? 0.7 : 1,
                    boxShadow: resolviendo ? "none" : "0 2px 8px rgba(26,102,68,0.25)",
                  }}
                >
                  {resolviendo ? "Guardando…" : "Marcar como revisado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </section>
  );
}

function EstadoBadge({ estado }: { estado: EstadoReporte }) {
  const cfg = {
    pendiente:    { bg: "#fffbeb", border: "#fcd34d", color: "#92400e", label: "Pendiente" },
    revisado:     { bg: "#f0fdf4", border: "#b8deca", color: "#1a6644", label: "Revisado"  },
    desestimado:  { bg: "#f9fafb", border: "#d1d5db", color: "#6b7280", label: "Desestimado" },
  }[estado] ?? { bg: "#f9fafb", border: "#d1d5db", color: "#6b7280", label: estado };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: 999, border: `1px solid ${cfg.border}`,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
    }}>
      {cfg.label}
    </span>
  );
}