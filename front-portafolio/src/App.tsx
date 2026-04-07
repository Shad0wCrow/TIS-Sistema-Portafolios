import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateAccount from "./pages/createAccount/createAccount";
import EdicionPortafolio from "./pages/editPortafolio/edicionPortafolio";


import ProfileRoute from "./components/ProfileRoute";
import CreateAccountRoute from "./components/CreateAccountRoute";

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Crear perfil */}
      <Route
        path="/createAccount"
        element={
          <CreateAccountRoute>
            <CreateAccount />
          </CreateAccountRoute>
        }
      />

      {/* Dashboard solo con perfil */}
      <Route
        path="/dashboard"
        element={
          <ProfileRoute>
            <Dashboard />
          </ProfileRoute>
        }
      />

      {/* Edición de portafolio */}
      <Route
        path="/portafolio/editar"
        element={
          <ProfileRoute>
            <EdicionPortafolio />
          </ProfileRoute>
        }
      />
    </Routes>
  );
}

export default App;