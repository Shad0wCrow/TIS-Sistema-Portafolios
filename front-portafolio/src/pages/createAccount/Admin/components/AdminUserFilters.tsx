interface AdminUserFiltersProps {
  search: string;
  estado: "todos" | "activos" | "inhabilitados";
  rol: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: "todos" | "activos" | "inhabilitados") => void;
  onRolChange: (value: string) => void;
}

export default function AdminUserFilters({
  search,
  estado,
  rol,
  onSearchChange,
  onEstadoChange,
  onRolChange,
}: AdminUserFiltersProps) {
  return (
    <div className="admin-filters">
      <label className="admin-filter-field">
        <span>Buscar</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre, usuario o correo"
        />
      </label>

      <label className="admin-filter-field">
        <span>Estado</span>
        <select
          value={estado}
          onChange={(event) => onEstadoChange(event.target.value as "todos" | "activos" | "inhabilitados")}
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inhabilitados">Inhabilitados</option>
        </select>
      </label>

      <label className="admin-filter-field">
        <span>Rol</span>
        <select value={rol} onChange={(event) => onRolChange(event.target.value)}>
          <option value="">Todos</option>
          <option value="admin">Admin</option>
          <option value="usuario">Usuario</option>
          <option value="developer">Developer</option>
        </select>
      </label>
    </div>
  );
}
