import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import AdminStatsCards from "./components/AdminStatsCards";
import AdminUserFilters from "./components/AdminUserFilters";
import AdminUsersTable from "./components/AdminUsersTable";
import AdminReportsPanel from "./components/AdminReportsPanel";
import {
  getAdminReportSummary,
  getAdminUsers,
  updateAdminUserStatus,
  type AdminReportSummary,
  type AdminUser,
} from "../../services/adminService";
import "./AdminDashboard.css";
import "./UsuariosReportados.css";

const PER_PAGE = 10;

export default function AdminUsuariosReportados() {
  const navigate = useNavigate();

  const currentUserId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return null;
      const user = JSON.parse(rawUser) as { id_usuario?: number; id?: number } | null;
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
  const [summary, setSummary] = useState<AdminReportSummary | null>(null);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"todos" | "activos" | "inhabilitados">("inhabilitados");
  const [rol, setRol] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [userToToggle, setUserToToggle] = useState<AdminUser | null>(null);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await getAdminReportSummary();
      setSummary(data);
    } catch {
      // La vista sigue funcionando aunque el resumen no responda.
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const data = await getAdminUsers({
        q: search.trim() || undefined,
        estado,
        rol: rol.trim() || undefined,
        page,
        per_page: PER_PAGE,
      });
      setUsers(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch {
      setUsers([]);
      setLastPage(1);
      setTotal(0);
      setError("No se pudieron cargar los usuarios reportados.");
    } finally {
      setLoadingUsers(false);
    }
  }, [search, estado, rol, page]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleEstadoChange(value: "todos" | "activos" | "inhabilitados") {
    setEstado(value);
    setPage(1);
  }

  function handleRolChange(value: string) {
    setRol(value);
    setPage(1);
  }

  function handleLogout() {
    ["token", "user", "hasProfile", "hasPortafolio"].forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem("dashboardPortafoliosCache");
    navigate("/login");
  }

  function requestToggle(user: AdminUser) {
    setUserToToggle(user);
    setMessage(null);
    setError(null);
  }

  async function confirmToggle() {
    if (!userToToggle) return;

    setUpdatingUserId(userToToggle.id_usuario);
    setError(null);
    try {
      const response = await updateAdminUserStatus(userToToggle.id_usuario, !userToToggle.eliminado);
      setMessage(response.message);
      setUserToToggle(null);
      await Promise.all([loadUsers(), loadSummary()]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo actualizar el estado del usuario.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="admin-page admin-users-page">
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Devfolio</span>
          <h1>Usuarios reportados</h1>
        </div>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <span className="admin-nav-link admin-nav-link--active">
            Usuarios
          </span>
          <Link to="/admin/reportes" className="admin-nav-link">
            Reportes
          </Link>
        </nav>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="admin-main admin-users-main">
        {(error || message) && (
          <div className={`admin-alert ${error ? "admin-alert-error" : ""}`} role="alert">
            {error || message}
          </div>
        )}

        <AdminStatsCards summary={summary?.resumen ?? null} />

        <section className="admin-section admin-users-shell">
          <div className="admin-section-header">
            <div>
              <h2>Gestión de usuarios</h2>
              <p>
                {total} usuario{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}{" "}
                {estado === "inhabilitados" ? "en observación" : "en el filtro actual"}.
              </p>
            </div>

            <div className="admin-users-head-actions">
              <button
                type="button"
                className="admin-refresh-btn"
                onClick={() => {
                  void loadUsers();
                  void loadSummary();
                }}
              >
                Actualizar
              </button>
            </div>
          </div>

          <AdminUserFilters
            search={search}
            estado={estado}
            rol={rol}
            onSearchChange={handleSearchChange}
            onEstadoChange={handleEstadoChange}
            onRolChange={handleRolChange}
          />

          <div className="admin-users-layout">
            <div className="admin-users-table-zone">
              <div className="admin-table-wrap">
                <AdminUsersTable
                  users={users}
                  loading={loadingUsers}
                  updatingUserId={updatingUserId}
                  currentUserId={currentUserId}
                  onToggleStatus={requestToggle}
                />
              </div>

              {lastPage > 1 && (
                <div className="admin-pagination">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || loadingUsers}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {page} de {lastPage}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
                    disabled={page >= lastPage || loadingUsers}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            <aside className="admin-users-sidebar">
              <AdminReportsPanel report={summary} />
              <article className="admin-report-card admin-users-note">
                <h2>Filtro recomendado</h2>
                <p className="admin-empty-text">
                  La vista abre por defecto con usuarios inhabilitados para revisar primero los casos más delicados.
                </p>
              </article>
              {loadingSummary && (
                <article className="admin-report-card">
                  <h2>Resumen</h2>
                  <p className="admin-empty-text">Cargando información general…</p>
                </article>
              )}
            </aside>
          </div>

        </section>
      </main>

      <ConfirmModal
        open={userToToggle !== null}
        title={userToToggle?.eliminado ? "Habilitar usuario" : "Inhabilitar usuario"}
        message={
          userToToggle
            ? `Vas a ${userToToggle.eliminado ? "habilitar" : "inhabilitar"} a @${userToToggle.nombre_usuario}. Esta acción puede cambiar su acceso al sistema.`
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
