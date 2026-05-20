import type { AdminReportSummary } from "../../../services/adminService";

interface AdminStatsCardsProps {
  summary: AdminReportSummary["resumen"] | null;
}

const stats = [
  ["usuarios_total", "Usuarios"],
  ["usuarios_activos", "Activos"],
  ["usuarios_inhabilitados", "Inhabilitados"],
  ["portafolios_publicados", "Portafolios"],
  ["visualizaciones_total", "Visualizaciones"],
  ["contactos_total", "Contactos"],
] as const;

export default function AdminStatsCards({ summary }: AdminStatsCardsProps) {
  return (
    <section className="admin-stats" aria-label="Resumen administrativo">
      {stats.map(([key, label]) => (
        <article className="admin-stat-card" key={key}>
          <span className="admin-stat-label">{label}</span>
          <strong className="admin-stat-value">{summary ? summary[key] : "-"}</strong>
        </article>
      ))}
    </section>
  );
}
