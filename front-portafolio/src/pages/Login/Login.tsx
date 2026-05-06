import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth";
import "./Login.css";
import fondoLanding from "../../assets/landing-bg.png";
import AuthLayout from "../../components/layout/AuthLayout";

const DASHBOARD_CACHE_KEY = "dashboardPortafoliosCache";

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ correo, contrasenia });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("hasPortafolio"); 
      localStorage.removeItem("hasProfile");
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      if (data.dashboard) {
        sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({
          publicacion: data.dashboard.publicacion ?? null,
          portafolios: data.dashboard.portafolios ?? [],
          cachedAt: Date.now(),
        }));
      }
      
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backgroundImage={fondoLanding}>
      <div className="login-card">
        <h1 className="login-title">Iniciar Sesión</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="login-input"
            />
          </div>
          <div className="login-field">
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              className="login-input"
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-button" disabled={loading} aria-busy={loading}>
            {loading && <span className="login-spinner" aria-hidden="true" />}
            <span>{loading ? "Entrando..." : "Entrar"}</span>
          </button>
          <p className="login-link-text">¿Olvidaste tu contraseña?</p>
          <Link to="/register" className="login-link">¿No tienes una cuenta?</Link>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;
