import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ComponentsHome/Header';
import Sidebar from '../../components/ComponentsHome/Sidebar';
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  type NotificacionUsuario,
} from '../../services/portafolioservice';
import '../Dashboard/Dashboard.css';

type EstadoFiltro = "todas" | "no_leidas" | "leidas";

const FILTER_LABELS: Record<EstadoFiltro, string> = {
  todas: "Todas",
  no_leidas: "No leidas",
  leidas: "Leidas",
};

export default function Notificaciones() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<EstadoFiltro>("todas");
  const [notificaciones, setNotificaciones] = useState<NotificacionUsuario[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NotificacionUsuario | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getNotificaciones(filtro, page);
      setNotificaciones(res.notificaciones.data);
      setLastPage(res.notificaciones.last_page);
      setNoLeidas(res.no_leidas);
    } catch {
      setError("No se pudieron cargar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }, [filtro, page]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const openNotification = async (notificacion: NotificacionUsuario) => {
    setSelected(notificacion);

    if (!notificacion.leida) {
      try {
        const res = await marcarNotificacionLeida(notificacion.id_notificacion);
        setNoLeidas(res.no_leidas);
        setNotificaciones((prev) =>
          prev.map((item) =>
            item.id_notificacion === notificacion.id_notificacion
              ? res.notificacion
              : item
          )
        );
        setSelected(res.notificacion);
      } catch {
        setError("No se pudo marcar la notificacion como leida.");
      }
    }
  };

  const markAllRead = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNoLeidas(0);
      setNotificaciones((prev) =>
        prev.map((item) => ({ ...item, leida: true, leida_en: item.leida_en ?? new Date().toISOString() }))
      );
      if (selected) {
        setSelected({ ...selected, leida: true, leida_en: selected.leida_en ?? new Date().toISOString() });
      }
    } catch {
      setError("No se pudieron marcar las notificaciones como leidas.");
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("es-BO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <section className="dashboard-content">
            <div className="notifications-shell">
              <div className="notifications-header">
                <div>
                  <span className="publication-kicker">Centro de notificaciones</span>
                  <h1 className="feed-title">Advertencias de reportes</h1>
                  <p className="feed-subtitle">
                    Revisa reportes recibidos sobre tu portafolio sin revelar la identidad del reportante.
                  </p>
                </div>
                <div className="notifications-header-actions">
                  <span className="publication-status">{noLeidas} sin leer</span>
                  <button
                    type="button"
                    className="publication-secondary-btn"
                    onClick={markAllRead}
                    disabled={noLeidas === 0}
                  >
                    Marcar todo leido
                  </button>
                </div>
              </div>

              <div className="notifications-layout">
                <section className="publication-card notifications-list-panel">
                  <div className="notifications-filters" role="tablist" aria-label="Filtro de notificaciones">
                    {(Object.keys(FILTER_LABELS) as EstadoFiltro[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={`notification-filter-btn${filtro === key ? " notification-filter-btn-active" : ""}`}
                        onClick={() => {
                          setFiltro(key);
                          setPage(1);
                          setSelected(null);
                        }}
                      >
                        {FILTER_LABELS[key]}
                      </button>
                    ))}
                  </div>

                  {error && <div className="notification-alert" role="alert">{error}</div>}

                  {loading ? (
                    <div className="feed-empty">
                      <h2 className="empty-state-text">Cargando notificaciones...</h2>
                    </div>
                  ) : notificaciones.length === 0 ? (
                    <div className="feed-empty">
                      <h2 className="empty-state-text">
                        {filtro === "no_leidas"
                          ? "No tienes advertencias pendientes."
                          : "No hay advertencias relacionadas con reportes."}
                      </h2>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notificaciones.map((item) => {
                        const isSelected = selected?.id_notificacion === item.id_notificacion;
                        return (
                          <button
                            key={item.id_notificacion}
                            type="button"
                            className={`notification-row${item.leida ? "" : " notification-row-unread"}${isSelected ? " notification-row-selected" : ""}`}
                            onClick={() => openNotification(item)}
                          >
                            <span className="notification-dot" aria-hidden="true" />
                            <span className="notification-row-body">
                              <strong>{item.titulo}</strong>
                              <span>{item.portafolio_nombre ?? "Portafolio publicado"}</span>
                              <small>{formatDate(item.creado_en)}</small>
                            </span>
                            {!item.leida && <span className="notification-row-badge">Nueva</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {lastPage > 1 && (
                    <div className="notifications-pagination">
                      <button
                        type="button"
                        className="publication-secondary-btn"
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page <= 1 || loading}
                      >
                        Anterior
                      </button>
                      <span>Pagina {page} de {lastPage}</span>
                      <button
                        type="button"
                        className="publication-secondary-btn"
                        onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
                        disabled={page >= lastPage || loading}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </section>

                <aside className="publication-card notification-detail-panel">
                  {selected ? (
                    <>
                      <span className="publication-kicker">
                        {selected.leida ? "Leida" : "Nueva advertencia"}
                      </span>
                      <h2 className="publication-title">{selected.titulo}</h2>
                      <p className="publication-description">{selected.mensaje}</p>

                      <dl className="notification-detail-list">
                        <div>
                          <dt>Portafolio reportado</dt>
                          <dd>{selected.portafolio_nombre ?? "Portafolio publicado"}</dd>
                        </div>
                        <div>
                          <dt>Fecha del reporte</dt>
                          <dd>{formatDate(selected.creado_en)}</dd>
                        </div>
                        <div>
                          <dt>Identidad del reportante</dt>
                          <dd>No disponible por privacidad.</dd>
                        </div>
                      </dl>

                      <div className="publication-actions">
                        {selected.slug_publico && (
                          <button
                            type="button"
                            className="publication-primary-btn"
                            onClick={() => navigate(`/portafolio/publico/${selected.slug_publico}`)}
                          >
                            Ver portafolio
                          </button>
                        )}
                        <button
                          type="button"
                          className="publication-secondary-btn"
                          onClick={() => navigate('/portafolio/editar')}
                        >
                          Revisar contenido
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="notification-empty-detail">
                      <span className="publication-kicker">Detalle</span>
                      <h2 className="publication-title">Selecciona una advertencia</h2>
                      <p className="publication-description">
                        Al abrir una notificacion se marcara como leida y podras revisar el portafolio relacionado.
                      </p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
