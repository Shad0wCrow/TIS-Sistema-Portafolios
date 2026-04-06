import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import "./Login.css";
import fondoLanding from "../assets/landing-bg.png";

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ correo, contrasenia });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="login-page">
      <section
        className="login-frame"
        style={{ backgroundImage: `url(${fondoLanding})` }}
      >
        <div className="login-overlay">
          <Link to="/" className="login-back">
            ↩
          </Link>

          <div className="login-card">
            <h1 className="login-title">Iniciar Sesion</h1>

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

              <button type="submit" className="login-button">
                Entrar
              </button>

              <p className="login-link-text">olvidaste tu contraseña?</p>

              <Link to="/register" className="login-link">
                no tienes una cuenta?
              </Link>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;