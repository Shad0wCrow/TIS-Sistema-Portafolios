import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Guardados from "./pages/Guardados/Guardados";
import CreateAccount from "./pages/createAccount/createAccount";
import EdicionPortafolio from "./pages/editPortafolio/edicionPortafolio";
import Portafolio from "./pages/portafolio/Portafolio";
import PortafolioPublico from "./pages/portafolio/PortafolioPublico";
import EditarPerfil from "./pages/SoloPerfil/editarPerfil";
import ConfiguracionPublicacion from "./pages/Visibilidad/ConfiguracionPublicacion";
import PublicarPortafolio from "./pages/Publicar/PublicarPortafolio";

// Admin — Dashboard: solo estadísticas de usuarios
import AdminDashboard from "./pages/Admin/AdminDashboard";
// Admin — Reportes: gestión de reportes (HU-61) + habilitar/inhabilitar (HU-45, HU-46)
import AdminReportes from "./pages/Admin/reportes/AdminReportes";
import EstadisticasUsuarios from "./pages/Admin/reportes/EstadisticasUsuarios";
import EstadisticasPortafolios from "./pages/Admin/reportes/EstadisticasPortafolios";

import CvGenerator from "./pages/editPortafolio/CvGenerator";

import CreateAccountRoute from "./components/CreateAccountRoute";
import PortafolioRoute from "./components/PortafolioRoute";
import ProfileRoute from "./components/ProfileRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/createAccount"
        element={
          <CreateAccountRoute>
            <CreateAccount />
          </CreateAccountRoute>
        }
      />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/guardados" element={<Guardados />} />

      {/* ── Rutas de administración ── */}

      {/* /admin → solo estadísticas de usuarios */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* /admin/estadisticas-usuarios → estadísticas de registros (HU-40) */}
      <Route
        path="/admin/estadisticas-usuarios"
        element={
          <AdminRoute>
            <EstadisticasUsuarios />
          </AdminRoute>
        }
      />

      {/* /admin/estadisticas-portafolios → estadísticas de portafolios (HU-40) */}
      <Route
        path="/admin/estadisticas-portafolios"
        element={
          <AdminRoute>
            <EstadisticasPortafolios />
          </AdminRoute>
        }
      />

      {/* /admin/reportes → reportes (HU-61) + habilitar/inhabilitar (HU-45, HU-46) */}
      <Route
        path="/admin/reportes"
        element={
          <AdminRoute>
            <AdminReportes />
          </AdminRoute>
        }
      />

      {/* Alias para compatibilidad con rutas anteriores */}
      <Route
        path="/admin/reportados"
        element={
          <AdminRoute>
            <AdminReportes />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/usuarios-reportados"
        element={
          <AdminRoute>
            <AdminReportes />
          </AdminRoute>
        }
      />

      {/* ── Rutas de perfil y portafolio ── */}

      <Route
        path="/perfil/editar"
        element={
          <ProfileRoute>
            <EditarPerfil />
          </ProfileRoute>
        }
      />

      <Route
        path="/portafolio"
        element={
          <PortafolioRoute>
            <Portafolio />
          </PortafolioRoute>
        }
      />

      <Route
        path="/portafolio/visibilidad"
        element={
          <PortafolioRoute>
            <ConfiguracionPublicacion />
          </PortafolioRoute>
        }
      />

      <Route
        path="/portafolio/publicar"
        element={
          <PortafolioRoute>
            <PublicarPortafolio />
          </PortafolioRoute>
        }
      />

      <Route
        path="/portafolio/publico/:slug"
        element={<PortafolioPublico />}
      />

      <Route
        path="/portafolio/editar"
        element={
          <PortafolioRoute>
            <EdicionPortafolio />
          </PortafolioRoute>
        }
      />

      <Route path="/generar-cv" element={<CvGenerator />} />
    </Routes>
  );
}

export default App;