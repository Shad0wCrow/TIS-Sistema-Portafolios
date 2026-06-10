import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoDevfolio from "../../assets/devfolio-logo.png";
import search from "../../assets/icons/Search.svg";
import { getResumenNotificaciones } from '../../services/portafolioservice';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getResumenNotificaciones()
      .then((res) => setNotificaciones(res.no_leidas ?? 0))
      .catch(() => setNotificaciones(0));
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log("Valor de busqueda:", e.target.value);
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-logo-container">
        <img
          src={logoDevfolio}
          alt="DevFolio Logo"
          className="dashboard-logo"
        />
      </div>

      <div className="dashboard-header-actions">
        <div className="dashboard-search-container">
          <input
            type="text"
            placeholder="Buscar..."
            className="dashboard-search-input"
            onChange={handleSearch}
          />
          <img src={search} alt="Search" className="search-icon" />
        </div>

        <button
          type="button"
          className="dashboard-notification-button"
          onClick={() => navigate('/notificaciones')}
          aria-label={`Notificaciones: ${notificaciones} sin leer`}
        >
          <span className="dashboard-notification-icon">!</span>
          <span>Alertas</span>
          {notificaciones > 0 && (
            <strong className="dashboard-notification-badge">
              {notificaciones > 99 ? "99+" : notificaciones}
            </strong>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
