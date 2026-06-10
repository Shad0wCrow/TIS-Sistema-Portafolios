import type { AdminUser } from "../../../services/adminService";

interface AdminUsersTableProps {
  users: AdminUser[];
  loading: boolean;
  updatingUserId: number | null;
  currentUserId: number | null;
  onToggleStatus: (user: AdminUser) => void;
}

export default function AdminUsersTable({
  users,
  loading,
  updatingUserId,
  currentUserId,
  onToggleStatus,
}: AdminUsersTableProps) {
  if (loading) {
    return <div className="admin-table-state">Cargando usuarios...</div>;
  }

  if (users.length === 0) {
    return <div className="admin-table-state">No se encontraron usuarios.</div>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Perfil</th>
            <th>Portafolio</th>
            <th>Creado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id_usuario}>
              <td>
                <div className="admin-user-cell">
                  <div className="admin-avatar">
                    {user.perfil?.foto_url ? (
                      <img src={user.perfil.foto_url} alt="" />
                    ) : (
                      user.nombre_usuario.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <strong>{user.nombre_usuario}</strong>
                    <span>{user.correo}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`admin-badge ${user.rol === "admin" ? "admin-badge-admin" : ""}`}>
                  {user.rol}
                </span>
              </td>
              <td>
                <span className={`admin-badge ${user.eliminado ? "admin-badge-disabled" : "admin-badge-active"}`}>
                  {user.estado}
                </span>
              </td>
              <td>
                <div className="admin-profile-cell">
                  <strong>{user.perfil?.nombre || "Sin perfil"}</strong>
                  <span>{user.perfil?.profesion || "Sin profesión"}</span>
                </div>
              </td>
              <td>
                {user.portafolio ? (
                  <span className={`admin-badge ${user.portafolio.publicado ? "admin-badge-active" : ""}`}>
                    {user.portafolio.publicado ? "Publicado" : "No publicado"}
                  </span>
                ) : (
                  <span className="admin-muted">Sin portafolio</span>
                )}
              </td>
              <td>{formatDate(user.creado_en)}</td>
              <td>
                {user.id_usuario === currentUserId ? (
                  <span className="admin-current-user">Cuenta admin actual</span>
                ) : (
                  <button
                    type="button"
                    className={user.eliminado ? "admin-action-enable" : "admin-action-disable"}
                    onClick={() => onToggleStatus(user)}
                    disabled={updatingUserId === user.id_usuario}
                  >
                    {updatingUserId === user.id_usuario
                      ? "Procesando..."
                      : user.eliminado
                        ? "Habilitar"
                        : "Inhabilitar"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-BO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}
