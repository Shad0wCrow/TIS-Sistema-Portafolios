import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

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
        navigate('/dashboard');
        break;

      case 'perfil':
        if (!token) {
          navigate('/login');
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
          navigate('/portafolio');
        } else {
          setShowModal(true);
        }
        break;

      case 'bookmarks':
        navigate('/dashboard');
        break;

      case 'salir':
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('hasPortafolio');
        localStorage.removeItem('hasProfile');
        navigate('/login');
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

  return (
    <>
      <aside className="dashboard-sidebar">
        <nav className="dashboard-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="dashboard-menu-item"
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
    </>
  );
};

export default Sidebar;
