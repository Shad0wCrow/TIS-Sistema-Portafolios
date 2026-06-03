import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ComponentsHome/Header";
import Sidebar from "../../components/ComponentsHome/Sidebar";
import { getPortafolioEstadisticas } from "../../services/portafolioservice";
import type { EstadisticasPortafolio } from "../../services/portafolioservice";
import "./Estadisticas.css";

const Estadisticas: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EstadisticasPortafolio | null>(null);
  const [filtro, setFiltro] = useState<string>("mes");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  const cargarEstadisticas = async (currentFiltro: string, start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params: { filtro?: string; fecha_inicio?: string; fecha_fin?: string } = {
        filtro: currentFiltro,
      };
      if (currentFiltro === "rango" && start && end) {
        params.fecha_inicio = start;
        params.fecha_fin = end;
      }
      const data = await getPortafolioEstadisticas(params);
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "No se pudieron cargar las estadísticas de tu portafolio."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas(filtro);
  }, []);

  const handleFilterClick = (tipo: string) => {
    setFiltro(tipo);
    if (tipo !== "rango") {
      cargarEstadisticas(tipo);
    }
  };

  const handleCustomRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) {
      setError("Por favor selecciona ambas fechas para el rango personalizado.");
      return;
    }
    cargarEstadisticas("rango", fechaInicio, fechaFin);
  };

  // Encontrar el valor máximo de vistas en la evolución para calcular porcentaje del gráfico CSS
  const maxVistas = stats?.evolucion_vistas && stats.evolucion_vistas.length > 0
    ? Math.max(...stats.evolucion_vistas.map(item => item.cantidad))
    : 0;

  return (
    <div className="estadisticas-page">
      <Header />
      <div className="estadisticas-layout">
        <Sidebar activeItem="estadisticas" />
        <main className="estadisticas-main">
          <div className="estadisticas-container">
            {/* Cabecera */}
            <div className="estadisticas-header-row">
              <h1 className="estadisticas-title">Estadisticas de mi portafolio</h1>
              <button
                type="button"
                className="btn-volver"
                onClick={() => navigate("/dashboard")}
              >
                Volver al inicio
              </button>
            </div>

            {error && (
              <div className="error-container" role="alert">
                <p>{error}</p>
              </div>
            )}

            {/* Panel de Filtros */}
            <div className="filters-card">
              <div className="filters-group">
                <span style={{ fontSize: "14px", fontWeight: "700" }}>Periodo de vistas:</span>
                <button
                  type="button"
                  className={`btn-filter ${filtro === "dia" ? "active" : ""}`}
                  onClick={() => handleFilterClick("dia")}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  className={`btn-filter ${filtro === "semana" ? "active" : ""}`}
                  onClick={() => handleFilterClick("semana")}
                >
                  Ultimos 7 dias
                </button>
                <button
                  type="button"
                  className={`btn-filter ${filtro === "mes" ? "active" : ""}`}
                  onClick={() => handleFilterClick("mes")}
                >
                  Ultimos 30 dias
                </button>
                <button
                  type="button"
                  className={`btn-filter ${filtro === "anio" ? "active" : ""}`}
                  onClick={() => handleFilterClick("anio")}
                >
                  Ultimo año
                </button>
                <button
                  type="button"
                  className={`btn-filter ${filtro === "rango" ? "active" : ""}`}
                  onClick={() => handleFilterClick("rango")}
                >
                  Rango personalizado
                </button>
              </div>

              {filtro === "rango" && (
                <form className="custom-range-inputs" onSubmit={handleCustomRangeSubmit}>
                  <div className="range-field">
                    <label htmlFor="fecha_inicio">Desde:</label>
                    <input
                      type="date"
                      id="fecha_inicio"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      required
                    />
                  </div>
                  <div className="range-field">
                    <label htmlFor="fecha_fin">Hasta:</label>
                    <input
                      type="date"
                      id="fecha_fin"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-apply-range">
                    Filtrar rango
                  </button>
                </form>
              )}
            </div>

            {loading ? (
              <div className="loader-container">
                <p>Cargando informacion de estadisticas...</p>
              </div>
            ) : (
              stats && (
                <>
                  {/* Tarjetas Informativas Resumidas */}
                  <div className="stats-summary-grid">
                    <div className="stat-card" tabIndex={0}>
                      <span className="stat-card-title">Vistas historicas</span>
                      <strong className="stat-card-value">{stats.total_vistas_historico}</strong>
                      {stats.total_vistas_historico === 0 && (
                        <p className="stat-card-empty-msg">
                          <strong>Aun no existen vistas para mi portafolio</strong>
                        </p>
                      )}
                    </div>

                    <div className="stat-card" tabIndex={0}>
                      <span className="stat-card-title">Usuarios que guardaron tu portafolio</span>
                      <strong className="stat-card-value">{stats.total_guardados_historico}</strong>
                      {stats.total_guardados_historico === 0 && (
                        <p className="stat-card-empty-msg">
                          <strong>Todavia no existen usuarios que lo hayan guardado</strong>
                        </p>
                      )}
                    </div>

                    <div className="stat-card" tabIndex={0}>
                      <span className="stat-card-title">Vistas en el periodo</span>
                      <strong className="stat-card-value">{stats.vistas_periodo}</strong>
                      <p className="stat-card-empty-msg" style={{ fontSize: "11px" }}>
                        <strong>Del {stats.periodo.fecha_inicio} al {stats.periodo.fecha_fin}</strong>
                      </p>
                    </div>

                    <div className="stat-card" tabIndex={0}>
                      <span className="stat-card-title">Guardados en el periodo</span>
                      <strong className="stat-card-value">{stats.guardados_periodo}</strong>
                      <p className="stat-card-empty-msg" style={{ fontSize: "11px" }}>
                        <strong>Del {stats.periodo.fecha_inicio} al {stats.periodo.fecha_fin}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Evolución de vistas en el tiempo */}
                  <div className="evolution-card" tabIndex={0}>
                    <h2 className="evolution-header">Evolucion de vistas por dia</h2>
                    {stats.evolucion_vistas.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                        No hay informacion de visitas en este rango de fechas.
                      </p>
                    ) : (
                      <div className="evolution-table-container">
                        <table className="evolution-table">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Vistas</th>
                              <th style={{ width: "60%" }}>Progreso</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.evolucion_vistas.map((item) => {
                              const pct = maxVistas > 0 ? (item.cantidad / maxVistas) * 100 : 0;
                              return (
                                <tr key={item.fecha}>
                                  <td>{item.fecha}</td>
                                  <td>{item.cantidad}</td>
                                  <td>
                                    <div className="evolution-bar-container">
                                      <div className="evolution-bar">
                                        <div
                                          className="evolution-bar-fill"
                                          style={{ width: `${pct}%` }}
                                        ></div>
                                      </div>
                                      <span className="evolution-bar-num">{item.cantidad}</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Conteo de registros por sección */}
                  <div className="section-counts-card" tabIndex={0}>
                    <h2 className="section-counts-title">Contenido registrado en mi portafolio</h2>
                    <div className="section-counts-grid">
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Proyectos</span>
                        <span className="section-value">{stats.secciones.proyectos}</span>
                      </div>
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Educacion formal</span>
                        <span className="section-value">{stats.secciones.educacion}</span>
                      </div>
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Cursos registrados</span>
                        <span className="section-value">{stats.secciones.cursos}</span>
                      </div>
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Experiencia laboral</span>
                        <span className="section-value">{stats.secciones.experiencia}</span>
                      </div>
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Certificaciones</span>
                        <span className="section-value">{stats.secciones.certificaciones}</span>
                      </div>
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Logros y distinciones</span>
                        <span className="section-value">{stats.secciones.logros}</span>
                      </div>
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Habilidades</span>
                        <span className="section-value">{stats.secciones.habilidades}</span>
                      </div>
                      <div className="section-count-item" tabIndex={0}>
                        <span className="section-name">Idiomas</span>
                        <span className="section-value">{stats.secciones.idiomas}</span>
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Estadisticas;
