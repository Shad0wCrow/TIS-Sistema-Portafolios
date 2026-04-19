import React from 'react';
import Sidebar from '../../components/ComponentsHome/Sidebar';
import Header from '../../components/ComponentsHome/Header';
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <section className="dashboard-content">
            <div className="empty-state-container">
              <h2 className="empty-state-text">Publicaciones aún no disponibles</h2>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;