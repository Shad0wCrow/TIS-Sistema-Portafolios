import "./Dashboard.css";
import logoDevfolio from "../assets/devfolio-logo.png";

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-menu">
            <div className="dashboard-menu-item">
              <div className="dashboard-menu-icon">⌂</div>
              <span>Inicio</span>
            </div>

            <div className="dashboard-menu-item">
              <div className="dashboard-menu-icon">◎</div>
              <span>Perfil</span>
            </div>

            <div className="dashboard-menu-item">
              <div className="dashboard-menu-icon">▣</div>
              <span>Portafolio</span>
            </div>

            <div className="dashboard-menu-item">
              <div className="dashboard-menu-icon">▥</div>
              <span>Próximamente</span>
            </div>

            <div className="dashboard-menu-item">
              <div className="dashboard-menu-icon">⇥</div>
              <span>Salir</span>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="dashboard-header">
            <img
              src={logoDevfolio}
              alt="Devfolio"
              className="dashboard-logo"
            />

            <div className="dashboard-header-center">Acerca de</div>

            <div className="dashboard-search">
              <input type="text" readOnly />
              <span className="dashboard-search-icon">⌕</span>
            </div>
          </header>

          <section className="dashboard-content">
            <div className="dashboard-grid">
              <Card />
              <Card />
              <Card />
              <Card />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="portfolio-card">
      <div className="portfolio-card-top">
        <div className="portfolio-avatar">A</div>

        <div>
          <p className="portfolio-name">Andres Suarez</p>
          <p className="portfolio-role">Ing. Electronico</p>
        </div>
      </div>

      <div className="portfolio-image" />

      <div className="portfolio-bottom">
        <div>
          <p className="portfolio-title">Title</p>
          <p className="portfolio-subtitle">Subtitle</p>
        </div>

        <div className="portfolio-tags">
          <span className="portfolio-tag">Secondary</span>
          <span className="portfolio-tag portfolio-tag-purple">Label</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;