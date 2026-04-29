import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateAccount from "./pages/createAccount/createAccount";
import EdicionPortafolio from "./pages/editPortafolio/edicionPortafolio";
import Portafolio from "./pages/portafolio/Portafolio";
import EditarPerfil from "./pages/SoloPerfil/editarPerfil";

import CreateAccountRoute from "./components/CreateAccountRoute";
import PortafolioRoute from "./components/PortafolioRoute";
import PerfilRoute from "./components/PerfilRoute";


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

      <Route
        path="/perfil/editar"
        element={
          <PerfilRoute>
            <EditarPerfil />
          </PerfilRoute>
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
        path="/portafolio/editar"
        element={
          <PortafolioRoute>
            <EdicionPortafolio />
          </PortafolioRoute>
        }
      />
    </Routes>
  );
}

export default App;