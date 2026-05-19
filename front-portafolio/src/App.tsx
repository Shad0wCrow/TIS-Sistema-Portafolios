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
import CvGenerator from './pages/editPortafolio/CvGenerator';

import CreateAccountRoute from "./components/CreateAccountRoute";
import PortafolioRoute from "./components/PortafolioRoute";



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

      <Route
        path="/perfil/editar"
        element={
          <PortafolioRoute>
            <EditarPerfil />
          </PortafolioRoute>
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

      <Route path="/portafolio/publico/:slug" element={<PortafolioPublico />} />

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
