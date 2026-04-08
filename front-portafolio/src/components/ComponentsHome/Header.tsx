import React from 'react';
import logoDevfolio from "../../assets/devfolio-logo.png";
import search from "../../assets/icons/search.svg";


const Header: React.FC = () => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log("Valor de búsqueda:", e.target.value);
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

      <div className="dashboard-search-container">
        <input 
          type="text" 
          placeholder="Buscar..." 
          className="dashboard-search-input"
          onChange={handleSearch}
        />
        <img src={search} alt="Search" className="search-icon" />
      </div>
    </header>
  );
};

export default Header;