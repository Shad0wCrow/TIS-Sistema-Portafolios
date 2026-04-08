import React from 'react';

import HomeIcon from '../../assets/icons/Home.svg';
import UserIcon from '../../assets/icons/perfil.svg';
import BriefcaseIcon from '../../assets/icons/Briefcase.svg';
import BookmarkIcon from '../../assets/icons/Bookmark.svg';
import LogoutIcon from '../../assets/icons/Logout.svg';


export interface MenuItem {
  name: string;
  icon: string;
  id: string;
}
interface SidebarProps {
  
}

const Sidebar: React.FC<SidebarProps> = () => {
  const menuItems: MenuItem[] = [
    { id: 'inicio', name: 'Inicio', icon: HomeIcon },
    { id: 'perfil', name: 'Perfil', icon: UserIcon },
    { id: 'portafolio', name: 'Portafolio', icon: BriefcaseIcon },
    { id: 'bookmarks', name: 'Guardados', icon: BookmarkIcon },
    { id: 'salir', name: 'Salir', icon: LogoutIcon },
  ];

  const handleNavigation = (id: string): void => {
    console.log(`Navegando a la sección: ${id}`);
  };

  return (
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
  );
};

export default Sidebar;