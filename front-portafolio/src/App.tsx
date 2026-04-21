import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import CreateAccount from "./pages/createAccount/createAccount";
import EdicionPortafolio from "./pages/editPortafolio/edicionPortafolio";
import Portafolio from "./pages/portafolio/Portafolio";


import ProfileRoute from "./components/ProfileRoute";
import CreateAccountRoute from "./components/CreateAccountRoute";
import PortafolioRoute from "./components/PortafolioRoute";

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Crear perfil (solo si NO tiene perfil aún) */}
      <Route
        path="/createAccount"
        element={
          <CreateAccountRoute>
            <CreateAccount />
          </CreateAccountRoute>
        }
      />

      
      <Route
        path="/dashboard"
        element={
          <ProfileRoute>
            <Dashboard />
          </ProfileRoute>
        }
      />
      <Route
      path="/portafolio"
      element={
        <ProfileRoute>
          <Portafolio />
        </ProfileRoute>
      }
     />
     
      <Route
        path="/portafolio/editar"
        element={
          <ProfileRoute>
            <PortafolioRoute>
              <EdicionPortafolio />
            </PortafolioRoute>
          </ProfileRoute>
        }
      />
    </Routes>
  );
}

export default App;