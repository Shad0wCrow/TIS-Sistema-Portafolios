import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ComponentsHome/Sidebar';
import Header from '../../components/ComponentsHome/Header';
import { getDashboardPortafolios, guardarPortafolio } from '../../services/portafolioservice';
import type { EstadoPublicacionPortafolio, PortafolioPublicoResumen } from '../../types/portafolioTypes';
import MyPublicationPanel from './components/MyPublicationPanel';
import PublicPortfolioSection from './components/PublicPortfolioSection';
import "./Dashboard.css";

const DASHBOARD_CACHE_KEY = 'dashboardPortafoliosCache';

interface DashboardCache {
  publicacion: EstadoPublicacionPortafolio | null;
  portafolios: PortafolioPublicoResumen[];
  cachedAt: number;
}

const readDashboardCache = (): DashboardCache | null => {
  try {
    const value = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!value) return null;

    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed?.portafolios)) {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }

    return {
      publicacion: parsed.publicacion ?? null,
      portafolios: parsed.portafolios,
      cachedAt: Number(parsed.cachedAt) || Date.now(),
    };
  } catch {
    sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
    return null;
  }
};

const writeDashboardCache = (data: Omit<DashboardCache, 'cachedAt'>) => {
  sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({
    ...data,
    cachedAt: Date.now(),
  }));
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const cachedDashboard = readDashboardCache();
  const [publicacion, setPublicacion] = useState<EstadoPublicacionPortafolio | null>(cachedDashboard?.publicacion ?? null);
  const [portafolios, setPortafolios] = useState<PortafolioPublicoResumen[]>(cachedDashboard?.portafolios ?? []);
  const [loadingPublicacion, setLoadingPublicacion] = useState(!cachedDashboard);
  const [loadingPortafolios, setLoadingPortafolios] = useState(!cachedDashboard);
  const [portafoliosError, setPortafoliosError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  useEffect(() => {
    getDashboardPortafolios(12)
      .then((data) => {
        setPublicacion(data.publicacion);
        setPortafolios(data.portafolios);
        setPortafoliosError(null);
        writeDashboardCache({
          publicacion: data.publicacion,
          portafolios: data.portafolios,
        });
      })
      .catch(() => {
        if (!cachedDashboard) {
          setPortafolios([]);
          setPublicacion(null);
          setPortafoliosError('No se pudieron cargar los portafolios publicados.');
        }
      })
      .finally(() => {
        setLoadingPublicacion(false);
        setLoadingPortafolios(false);
      });
  }, []);

  const handleCopy = async () => {
    if (!publicacion?.url_publica) return;
    await navigator.clipboard.writeText(publicacion.url_publica);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const abrirPortafolio = (slug: string) => {
    navigate(`/portafolio/publico/${slug}`);
  };

  const guardarDesdeHome = async (slug: string) => {
    if (savingSlug) return;

    try {
      setSavingSlug(slug);
      await guardarPortafolio(slug);
    } catch (err: any) {
      const message = err?.response?.data?.errors?.portafolio?.[0]
        ?? err?.response?.data?.message
        ?? 'No se pudo guardar el portafolio.';
      setPortafoliosError(message);
    } finally {
      setSavingSlug(null);
    }
  };

  return (
    <div className="dashboard-page">
      <Header />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <section className="dashboard-content">
            <div className="dashboard-feed">
              <section className="dashboard-section">
                <MyPublicationPanel
                  publicacion={publicacion}
                  loading={loadingPublicacion}
                  copied={copied}
                  onCopy={handleCopy}
                  onOpen={abrirPortafolio}
                  onConfigure={() => navigate('/portafolio/publicar')}
                />
              </section>

              <PublicPortfolioSection
                portafolios={portafolios}
                loading={loadingPortafolios}
                error={portafoliosError}
                savingSlug={savingSlug}
                onOpen={abrirPortafolio}
                onSave={guardarDesdeHome}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
