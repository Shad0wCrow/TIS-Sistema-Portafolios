import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HomeIcon from '../../assets/icons/Home.svg';
import UserIcon from '../../assets/icons/perfil.svg';
import BriefcaseIcon from '../../assets/icons/Briefcase.svg';
import BookmarkIcon from '../../assets/icons/Bookmark.svg';
import LogoutIcon from '../../assets/icons/Logout.svg';

import ModalCrearPortafolio from '../portafolio/ModalCrearPortafolio';

export interface MenuItem {
  name: string;
  icon: string;
  id: string;
}

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'inicio',     name: 'Inicio',    icon: HomeIcon      },
    { id: 'perfil',     name: 'Perfil',    icon: UserIcon      },
    { id: 'portafolio', name: 'Portafolio', icon: BriefcaseIcon },
    { id: 'bookmarks',  name: 'Guardados', icon: BookmarkIcon  },
    { id: 'salir',      name: 'Salir',     icon: LogoutIcon    },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (localStorage.getItem('hasProfile') !== null) return;

    const syncProfileState = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/perfil/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        localStorage.setItem('hasProfile', data.has_profile ? 'true' : 'false');
      } catch (error) {
        console.error('Error verificando perfil:', error);
      }
    };

    void syncProfileState();
  }, []);

  const handleNavigation = (id: string): void => {
    const token = localStorage.getItem('token');
    const hasProfile = localStorage.getItem('hasProfile') === 'true';
    const hasPortafolio = localStorage.getItem('hasPortafolio') === 'true';

    switch (id) {
      case 'inicio':
        if (onNavigate) {
          onNavigate('inicio');
          return;
        }
        navigate('/dashboard');
        break;

      case 'perfil':
        if (!token) {
          navigate('/login');
          return;
        }
        if (onNavigate) {
          onNavigate('perfil');
          return;
        }
        if (hasProfile) {
          navigate('/perfil/editar');
        } else {
          navigate('/createAccount');
        }
        break;

      case 'portafolio':
        if (hasPortafolio) {
          navigate('/portafolio/editar');
        } else {
          setShowModal(true);
        }
        break;

      case 'bookmarks':
        if (onNavigate) {
          onNavigate('bookmarks');
          return;
        }
        navigate('/guardados');
        break;

      case 'salir':
        setShowLogoutConfirm(true);
        break;

      default:
        console.warn('Ruta no definida:', id);
    }
  };

  const handleCrear = () => {
    localStorage.setItem('hasPortafolio', 'true');
    setShowModal(false);
    navigate('/portafolio/editar');
  };

  const handleOmitir = () => {
    setShowModal(false);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hasPortafolio');
    localStorage.removeItem('hasProfile');
    sessionStorage.removeItem('dashboardPortafoliosCache');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const routeActiveItem = (): string => {
    if (location.pathname.startsWith('/guardados')) return 'bookmarks';
    if (location.pathname.startsWith('/perfil') || location.pathname.startsWith('/createAccount')) return 'perfil';
    if (location.pathname.startsWith('/portafolio')) return 'portafolio';
    return 'inicio';
  };

  const selectedItem = activeItem ?? routeActiveItem();

  return (
    <>
      <aside className="dashboard-sidebar">
        <nav className="dashboard-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`dashboard-menu-item ${selectedItem === item.id ? 'dashboard-menu-item-active' : ''}`}
              onClick={() => handleNavigation(item.id)}
              type="button"
            >
              <img
                src={item.icon}
                alt={item.name}
                className="dashboard-menu-icon-svg"
              />
              <span className="dashboard-menu-text">{item.name}</span>
            </button>
          ))}
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
              <button type="button" className="logout-modal-secondary" onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
              <button type="button" className="logout-modal-primary" onClick={handleConfirmLogout}>
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
