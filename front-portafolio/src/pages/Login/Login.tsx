import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/auth";
import { enviarSolicitudReactivacion } from "../../services/adminService";
import "./Login.css";
import fondoLanding from "../../assets/landing-bg.png";
import AuthLayout from "../../components/layout/AuthLayout";

const DASHBOARD_CACHE_KEY = "dashboardPortafoliosCache";


function esCuentaInhabilitada(err: any): boolean {
  const status  = err?.response?.status;
  const data    = err?.response?.data;

  // Campo explícito que ahora devuelve el backend
  if (data?.estado === "inhabilitado") return true;

  // Fallback por palabras clave en cualquier campo del mensaje
  const msg: string = (
    data?.message ??
    data?.error   ??
    data?.errors?.correo?.[0] ??
    err?.message  ??
    ""
  ).toLowerCase();

  const porPalabra =
    msg.includes("inhabilitad") ||
    msg.includes("desactivad")  ||
    msg.includes("disabled")    ||
    msg.includes("suspendid")   ||
    msg.includes("bloqueado");

  // Status 403 siempre es cuenta inhabilitada en este sistema
  return porPalabra || status === 403;
}

type Pantalla = "login" | "inhabilitado" | "solicitud-enviada" | "baneado" ;

function Login() {
  const navigate = useNavigate();

  // ── Login form ──────────────────────────────────────────────────────
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Flujo de cuenta inhabilitada (HU-95 CA-11) ──────────────────────
  const [pantalla, setPantalla] = useState<Pantalla>("login");
  const [mensajeReactivacion, setMensajeReactivacion] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // ── Handlers login ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ correo, contrasenia });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("hasProfile", data.has_profile ? "true" : "false");
      localStorage.setItem("hasPortafolio", data.has_portafolio ? "true" : "false");
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      if (data.dashboard) {
        sessionStorage.setItem(
          DASHBOARD_CACHE_KEY,
          JSON.stringify({
            publicacion: data.dashboard.publicacion ?? null,
            portafolios: data.dashboard.portafolios ?? [],
            cachedAt: Date.now(),
          })
        );
      }
      navigate(data.user?.rol === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      if (esCuentaInhabilitada(err)) {
        const tokenParcial = err?.response?.data?.token;
        if (tokenParcial) {
          localStorage.setItem("token", tokenParcial);
        }
        // Guardar correo para enviarlo con la solicitud (no hay token en el 403)
        localStorage.setItem("correo_inhabilitado", correo);
        if (err?.response?.data?.estado === "baneado") {
          setPantalla("baneado");
        } else {
          setPantalla("inhabilitado");
        }
      } else {
        setError(
          err?.response?.data?.errors?.correo?.[0] ||
          err?.response?.data?.message             ||
          "Error al iniciar sesión"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers solicitud de reactivación (HU-95 CA-11) ────────────────
  async function handleEnviarSolicitud(e: React.FormEvent) {
    e.preventDefault();
    if (!mensajeReactivacion.trim()) {
      setMensajeError("Por favor escribe un mensaje antes de enviar.");
      return;
    }
    setMensajeError("");
    setEnviando(true);
    try {
      await enviarSolicitudReactivacion(mensajeReactivacion.trim());
      setPantalla("solicitud-enviada");
    } catch (err: any) {
      setMensajeError(
        err?.response?.data?.message || "No se pudo enviar la solicitud. Intenta de nuevo."
      );
    } finally {
      setEnviando(false);
    }
  }

function volverALogin() {
    setPantalla("login");
    setMensajeReactivacion("");
    setMensajeError("");
    localStorage.removeItem("token");
    localStorage.removeItem("correo_inhabilitado");
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <AuthLayout backgroundImage={fondoLanding}>

      {/* ── PANTALLA 1: Login normal ── */}
      {pantalla === "login" && (
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
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <input
                type="password"
                placeholder="Contraseña"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                className="login-input"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
              aria-busy={loading}
            >
              {loading && <span className="login-spinner" aria-hidden="true" />}
              <span>{loading ? "Entrando..." : "Entrar"}</span>
            </button>
            <p className="login-link-text">¿Olvidaste tu contraseña?</p>
            <Link to="/register" className="login-link">
              ¿No tienes una cuenta?
            </Link>
          </form>
        </div>
      )}

      {/* ── PANTALLA 2: Cuenta inhabilitada — solicitar reactivación (HU-95 CA-11) ── */}
      {pantalla === "inhabilitado" && (
        <div className="login-card login-card--inhabilitado">
          {/* Icono de advertencia */}
          <div className="login-inhabilitado-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="login-title login-title--sm">Cuenta inhabilitada</h1>
          <p className="login-inhabilitado-desc">
            Tu cuenta ha sido inhabilitada por el equipo de administración. Si
            crees que esto es un error, puedes enviarnos un mensaje solicitando
            la reactivación. Si tu solicitud es rechazada, tu cuenta podría ser permanentemente restringida.
          </p>

          <form
            className="login-form"
            onSubmit={handleEnviarSolicitud}
            aria-label="Solicitar reactivación de cuenta"
          >
            <div className="login-field">
              <label
                htmlFor="mensaje-reactivacion"
                className="login-field-label"
              >
                Tu mensaje al administrador
                <span className="login-field-required" aria-hidden="true">
                  {" "}
                  *
                </span>
              </label>
              <textarea
                id="mensaje-reactivacion"
                className={`login-textarea${mensajeError ? " login-textarea--error" : ""}`}
                value={mensajeReactivacion}
                onChange={(e) => {
                  setMensajeReactivacion(e.target.value);
                  if (e.target.value.trim()) setMensajeError("");
                }}
                placeholder="Explica el motivo por el que solicitas la reactivación de tu cuenta…"
                rows={4}
                disabled={enviando}
                aria-required="true"
                aria-invalid={!!mensajeError}
                aria-describedby={mensajeError ? "mensaje-error" : undefined}
              />
              {mensajeError && (
                <p
                  id="mensaje-error"
                  className="login-field-error"
                  role="alert"
                >
                  {mensajeError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="login-button login-button--outline"
              disabled={enviando}
              aria-busy={enviando}
            >
              {enviando && (
                <span className="login-spinner" aria-hidden="true" />
              )}
              <span>
                {enviando ? "Enviando solicitud…" : "Enviar solicitud de reactivación"}
              </span>
            </button>
          </form>

          <button
            type="button"
            className="login-link login-link--btn"
            onClick={volverALogin}
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      )}  
      {/* ── PANTALLA 3: Ban permanente — solicitud rechazada por admin ── */}
      {pantalla === "baneado" && (
        <div className="login-card login-card--baneado">
          <div className="login-baneado-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>

          <h1 className="login-title login-title--sm">Acceso permanentemente restringido</h1>

          <p className="login-inhabilitado-desc">
            Tu cuenta ha sido <strong>baneada permanentemente</strong> por el equipo de
            administración. Tu solicitud de reactivación fue revisada y rechazada.
            No es posible recuperar el acceso a esta cuenta.
          </p>

          <p className="login-inhabilitado-desc" style={{ marginTop: 0 }}>
            Si crees que existe un error, contacta al soporte directamente por
            fuera de la plataforma en <a href="mailto:enigmasoftsrl@gmail.com?subject=Revisión%20de%20cuenta%20baneada" style={{ color: "#10b981", textDecoration: "none", fontWeight: "bold" }}>enigmasoftsrl@gmail.com</a>.
          </p>

          <button
            type="button"
            className="login-button"
            onClick={volverALogin}
          >
            Volver al inicio de sesión
          </button>
        </div>
      )}
      {/* ── PANTALLA 4: Solicitud enviada correctamente */}
      {pantalla === "solicitud-enviada" && (
        <div className="login-card login-card--success">
          <div className="login-success-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1 className="login-title login-title--sm">Solicitud enviada</h1>
          <p className="login-inhabilitado-desc">
            Tu solicitud de reactivación fue registrada. El equipo de
            administración la revisará y recibirás una respuesta pronto.
          </p>

          <button
            type="button"
            className="login-button"
            onClick={volverALogin}
          >
            Volver al inicio de sesión
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

export default Login;