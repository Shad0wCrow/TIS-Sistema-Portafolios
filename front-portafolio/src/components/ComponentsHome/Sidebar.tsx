import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import HomeIcon from "../../assets/icons/Home.svg";
import UserIcon from "../../assets/icons/perfil.svg";
import BriefcaseIcon from "../../assets/icons/Briefcase.svg";
import BookmarkIcon from "../../assets/icons/Bookmark.svg";
import LogoutIcon from "../../assets/icons/Logout.svg";
import ChartIcon from "../../assets/icons/Chart.svg";
import { useSidebar } from "../../context/SidebarContext";
import ModalCrearPortafolio from "../portafolio/ModalCrearPortafolio";

export interface MenuItem {
  name: string;
  icon: string;
  id: string;
}

interface QuickAction {
  label: string;
  description: string;
  action: string;
}

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, closeSidebar } = useSidebar();

  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const prevPathRef = useRef(location.pathname);

  const menuItems: MenuItem[] = [
    { id: "inicio", name: "Inicio", icon: HomeIcon },
    { id: "perfil", name: "Perfil", icon: UserIcon },
    { id: "portafolio", name: "Portafolio", icon: BriefcaseIcon },
    { id: "estadisticas", name: "Estadísticas", icon: ChartIcon },
    { id: "bookmarks", name: "Guardados", icon: BookmarkIcon },
    { id: "salir", name: "Salir", icon: LogoutIcon },
  ];

  const quickActions: Record<string, QuickAction[]> = {
    portafolio: [
      { label: "Editar portafolio", description: "Modificar secciones y contenido", action: "portafolio" },
      { label: "Vista previa", description: "Revisar como se vera tu portafolio", action: "vista-portafolio" },
      { label: "Publicar", description: "Configurar enlace publico", action: "publicar" },
      { label: "Visibilidad", description: "Controlar secciones visibles", action: "visibilidad" },
      { label: "Generar CV", description: "Crear un CV desde tu informacion", action: "generar-cv" },
    ],
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (localStorage.getItem("hasProfile") !== null) return;

    const syncProfileState = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/perfil/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        localStorage.setItem("hasProfile", data.has_profile ? "true" : "false");
        if (data.has_profile) localStorage.setItem("hasPortafolio", "true");
      } catch (error) {
        console.error("Error verificando perfil:", error);
      }
    };

    void syncProfileState();
  }, []);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname, closeSidebar]);

  const closeIfMobile = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  const handleNavigation = (id: string): void => {
    const token = localStorage.getItem("token");
    const hasProfile = localStorage.getItem("hasProfile") === "true";
    const hasPortafolio = localStorage.getItem("hasPortafolio") === "true";

    switch (id) {
      case "inicio":
        if (onNavigate) {
          onNavigate("inicio");
          closeIfMobile();
          return;
        }
        navigate("/dashboard");
        closeIfMobile();
        break;

      case "perfil":
        if (!token) {
          navigate("/login");
          closeIfMobile();
          return;
        }
        if (onNavigate) {
          onNavigate("perfil");
          closeIfMobile();
          return;
        }
        if (hasProfile) {
          navigate("/perfil/editar");
        } else {
          navigate("/createAccount");
        }
        closeIfMobile();
        break;

      case "portafolio":
        if (hasPortafolio) {
          navigate("/portafolio/editar");
        } else {
          setShowModal(true);
        }
        closeIfMobile();
        break;

      case "estadisticas":
        navigate("/portafolio/estadisticas");
        closeIfMobile();
        break;

      case "bookmarks":
        if (onNavigate) {
          onNavigate("bookmarks");
          closeIfMobile();
          return;
        }
        navigate("/guardados");
        closeIfMobile();
        break;

      case "salir":
        setShowLogoutConfirm(true);
        break;

      default:
        console.warn("Ruta no definida:", id);
    }
  };

  const handleQuickAction = (action: string): void => {
    switch (action) {
      case "notificaciones":
        navigate("/notificaciones");
        closeIfMobile();
        break;
      case "crear-perfil":
        navigate("/createAccount");
        closeIfMobile();
        break;
      case "vista-portafolio":
        navigate("/portafolio");
        closeIfMobile();
        break;
      case "publicar":
        navigate("/portafolio/publicar");
        closeIfMobile();
        break;
      case "visibilidad":
        navigate("/portafolio/visibilidad");
        closeIfMobile();
        break;
      case "generar-cv":
        navigate("/generar-cv");
        closeIfMobile();
        break;
      default:
        handleNavigation(action);
        break;
    }
  };

  const handleCrear = () => {
    localStorage.setItem("hasPortafolio", "true");
    setShowModal(false);
    navigate("/portafolio/editar");
    closeIfMobile();
  };

  const handleOmitir = () => {
    setShowModal(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("hasPortafolio");
    localStorage.removeItem("hasProfile");
    sessionStorage.removeItem("dashboardPortafoliosCache");
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const routeActiveItem = (): string => {
    if (location.pathname.startsWith("/guardados")) return "bookmarks";
    if (location.pathname.startsWith("/perfil") || location.pathname.startsWith("/createAccount")) return "perfil";
    if (location.pathname.startsWith("/portafolio/estadisticas")) return "estadisticas";
    if (location.pathname.startsWith("/portafolio")) return "portafolio";
    return "inicio";
  };

  const selectedItem = activeItem ?? routeActiveItem();

  return (
    <>
      {isOpen && window.innerWidth <= 768 && (
        <button
          type="button"
          className="dashboard-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Cerrar menú lateral"
        />
      )}

      <aside
        className={[
          "dashboard-sidebar",
          isOpen ? "dashboard-sidebar-open" : "dashboard-sidebar-closed",
          window.innerWidth <= 768 ? "dashboard-sidebar-mobile" : "dashboard-sidebar-desktop",
        ].join(" ")}
      >
        <nav className="dashboard-menu">
          {menuItems.map((item) => {
            const actions = quickActions[item.id] ?? [];

            return (
              <div
                className={`dashboard-menu-group${actions.length > 0 ? " dashboard-menu-group-has-panel" : ""}`}
                key={item.id}
              >
                <button
                  className={`dashboard-menu-item ${selectedItem === item.id ? "dashboard-menu-item-active" : ""}`}
                  onClick={() => handleNavigation(item.id)}
                  type="button"
                  aria-describedby={actions.length > 0 ? `quick-actions-${item.id}` : undefined}
                >
                  <img
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    className="dashboard-menu-icon-svg"
                  />
                  <span className="dashboard-menu-text">{item.name}</span>
                </button>

                {actions.length > 0 && (
                  <div
                    id={`quick-actions-${item.id}`}
                    className="dashboard-quick-panel"
                    role="menu"
                    aria-label={`Accesos de ${item.name}`}
                  >
                    <div className="dashboard-quick-panel-title">{item.name}</div>
                    <div className="dashboard-quick-panel-list">
                      {actions.map((quickAction) => (
                        <button
                          key={quickAction.action}
                          type="button"
                          className="dashboard-quick-action"
                          role="menuitem"
                          onClick={() => handleQuickAction(quickAction.action)}
                        >
                          <span className="dashboard-quick-action-label">{quickAction.label}</span>
                          <span className="dashboard-quick-action-description">
                            {quickAction.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {showModal && (
        <ModalCrearPortafolio
          onCrear={handleCrear}
          onOmitir={handleOmitir}
        />
      )}

      {showLogoutConfirm && (
        <div className="logout-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="logout-modal">
            <h2 id="logout-title" className="logout-modal-title">Cerrar sesion</h2>
            <p className="logout-modal-text">¿Estas seguro de que quieres salir?</p>
            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-modal-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="logout-modal-primary"
                onClick={handleConfirmLogout}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;