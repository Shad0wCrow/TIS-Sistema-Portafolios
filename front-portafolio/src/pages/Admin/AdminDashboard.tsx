import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import {
  getAdminReportSummary,
  getAdminUsers,
  updateAdminUserStatus,
  type AdminReportSummary,
  type AdminUser,
} from "../../services/adminService";
import AdminReportsPanel from "./components/AdminReportsPanel";
import AdminStatsCards from "./components/AdminStatsCards";
import AdminUserFilters from "./components/AdminUserFilters";
import AdminUsersTable from "./components/AdminUsersTable";
import "./AdminDashboard.css";

const PER_PAGE = 12;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [report, setReport] = useState<AdminReportSummary | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"todos" | "activos" | "inhabilitados">("todos");
  const [rol, setRol] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReport, setLoadingReport] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    loadReport();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [debouncedSearch, estado, rol, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estado, rol]);

  async function loadReport() {
    setLoadingReport(true);
    try {
      const data = await getAdminReportSummary();
      setReport(data);
    } catch {
      setError("No se pudo cargar el resumen administrativo.");
    } finally {
      setLoadingReport(false);
    }
  }

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await getAdminUsers({
        q: debouncedSearch.trim() || undefined,
        estado,
        rol: rol || undefined,
        page,
        per_page: PER_PAGE,
      });
      setUsers(data.data);
      setLastPage(data.last_page);
      setTotalUsers(data.total);
    } catch {
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function confirmStatusChange() {
    if (!selectedUser) return;

    setUpdatingUserId(selectedUser.id_usuario);
    setError(null);

    try {
      const nextDeleted = !selectedUser.eliminado;
      const response = await updateAdminUserStatus(selectedUser.id_usuario, nextDeleted);
      setUsers((current) =>
        current.map((user) =>
          user.id_usuario === selectedUser.id_usuario
            ? {
                ...user,
                eliminado: response.usuario.eliminado,
                estado: response.usuario.estado,
              }
            : user
        )
      );
      setMessage(response.message);
      setSelectedUser(null);
      await loadReport();
      window.setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || firstValidationMessage(err) || "No se pudo actualizar el usuario.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasProfile");
    localStorage.removeItem("hasPortafolio");
    sessionStorage.removeItem("dashboardPortafoliosCache");
    navigate("/login");
  }

  const selectedAction = selectedUser?.eliminado ? "habilitar" : "inhabilitar";
  const currentUserId = getCurrentUserId();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-kicker">Devfolio</span>
          <h1>Panel administrativo</h1>
        </div>
        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </header>

      <main className="admin-main">
        {(message || error) && (
          <div className={`admin-alert ${error ? "admin-alert-error" : ""}`}>
            {error || message}
          </div>
        )}

        <AdminStatsCards summary={loadingReport ? null : report?.resumen ?? null} />

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Usuarios registrados</h2>
              <p>{totalUsers} usuarios encontrados</p>
            </div>
          </div>

          <AdminUserFilters
            search={search}
            estado={estado}
            rol={rol}
            onSearchChange={setSearch}
            onEstadoChange={setEstado}
            onRolChange={setRol}
          />

          <AdminUsersTable
            users={users}
            loading={loadingUsers}
            updatingUserId={updatingUserId}
            currentUserId={currentUserId}
            onToggleStatus={setSelectedUser}
          />

          <div className="admin-pagination">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
              Anterior
            </button>
            <span>Página {page} de {lastPage}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(lastPage, current + 1))} disabled={page >= lastPage}>
              Siguiente
            </button>
          </div>
        </section>

        <AdminReportsPanel report={report} />
      </main>

      <ConfirmModal
        open={!!selectedUser}
        title={`${capitalize(selectedAction)} usuario`}
        message={`¿Seguro que quieres ${selectedAction} la cuenta de ${selectedUser?.nombre_usuario}? Esta acción no elimina sus datos.`}
        confirmLabel={capitalize(selectedAction)}
        cancelLabel="Cancelar"
        variant={selectedUser?.eliminado ? "primary" : "danger"}
        loading={updatingUserId === selectedUser?.id_usuario}
        onConfirm={confirmStatusChange}
        onCancel={() => setSelectedUser(null)}
      />
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

function firstValidationMessage(err: any): string | null {
  const errors = err?.response?.data?.errors;
  if (!errors) return null;
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey]?.[0] ?? null : null;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getCurrentUserId(): number | null {
  try {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    return Number(user?.id_usuario) || null;
  } catch {
    return null;
  }
}
