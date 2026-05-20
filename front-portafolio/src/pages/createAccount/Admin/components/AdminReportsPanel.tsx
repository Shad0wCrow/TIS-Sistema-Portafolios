import type { AdminReportSummary, AdminRankingItem } from "../../../services/adminService";

interface AdminReportsPanelProps {
  report: AdminReportSummary | null;
}

export default function AdminReportsPanel({ report }: AdminReportsPanelProps) {
  return (
    <section className="admin-reports">
      <RankingList
        title="Portafolios más vistos"
        emptyText="Sin visualizaciones registradas."
        items={report?.top_visualizaciones ?? []}
        metricKey="total_visualizaciones"
        metricLabel="vistas"
      />
      <RankingList
        title="Más contactos directos"
        emptyText="Sin contactos registrados."
        items={report?.top_contactos ?? []}
        metricKey="total_contactos"
        metricLabel="contactos"
      />
      <article className="admin-report-card">
        <h2>Usuarios recientes</h2>
        {report?.usuarios_recientes?.length ? (
          <ul className="admin-recent-list">
            {report.usuarios_recientes.map((user) => (
              <li key={user.id_usuario}>
                <div>
                  <strong>{user.nombre_usuario}</strong>
                  <span>{user.correo}</span>
                </div>
                <span className={`admin-badge ${user.estado === "activo" ? "admin-badge-active" : "admin-badge-disabled"}`}>
                  {user.estado}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-empty-text">Sin usuarios recientes.</p>
        )}
      </article>
    </section>
  );
}

function RankingList({
  title,
  emptyText,
  items,
  metricKey,
  metricLabel,
}: {
  title: string;
  emptyText: string;
  items: AdminRankingItem[];
  metricKey: "total_visualizaciones" | "total_contactos";
  metricLabel: string;
}) {
  return (
    <article className="admin-report-card">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="admin-ranking-list">
          {items.map((item) => (
            <li key={`${metricKey}-${item.id_publicacion}`}>
              <div>
                <strong>{item.nombre}</strong>
                <span>{item.profesion || item.nombre_usuario}</span>
              </div>
              <b>{item[metricKey] ?? 0} {metricLabel}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-empty-text">{emptyText}</p>
      )}
    </article>
  );
}
