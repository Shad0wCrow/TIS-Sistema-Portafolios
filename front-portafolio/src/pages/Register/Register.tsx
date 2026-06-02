import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/auth";
import "./Register.css";
import fondoLanding from "../../assets/landing-bg.png";
import AuthLayout from "../../components/layout/AuthLayout";

function Register() {
  const [nombre_usuario, setNombreUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorContrasenia, setErrorContrasenia] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorTerms, setErrorTerms] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorCorreo("");
    setErrorContrasenia("");
    setErrorGeneral("");
    setErrorTerms("");

    let hasError = false;

    if (contrasenia.length < 8) {
      setErrorContrasenia("La contraseÃ±a debe tener mas de 8 carÃ¡cteres");
      hasError = true;
    }

    if (!correo.includes("@")) {
      setErrorCorreo("Ingresa un correo vÃ¡lido");
      hasError = true;
    }

    if (!acceptTerms) {
      setErrorTerms("Debes aceptar los términos y condiciones para continuar");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const data = await registerUser({
        nombre_usuario,
        correo,
        contrasenia,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("hasPortafolio");
      localStorage.setItem("hasProfile", "false");
      navigate("/dashboard");
    } catch (err: any) {
      const responseData = err?.response?.data;

      if (responseData?.errors?.correo) {
        setErrorCorreo("ya existe una cuenta con este gmail");
      } else if (responseData?.errors?.contrasenia) {
        setErrorContrasenia("La contraseÃ±a debe tener mas de 8 carÃ¡cteres");
      } else {
        setErrorGeneral("No se pudo crear la cuenta");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backgroundImage={fondoLanding}>
      <div className="register-card">
        <h1 className="register-title">Registrarse</h1>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <input
              type="text"
              placeholder="Alias"
              value={nombre_usuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="register-input"
            />
          </div>

          <div className="register-field">
            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="register-input"
            />
            {errorCorreo && (
              <p className="register-error register-error-tight">
                {errorCorreo}
              </p>
            )}
          </div>

          <div className="register-field">
            <input
              type="password"
              placeholder="ContraseÃ±a"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              className="register-input"
            />
            {errorContrasenia && (
              <p className="register-error">{errorContrasenia}</p>
            )}
          </div>

          <div className="register-field" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#333", fontSize: "0.9rem", marginBottom: "10px" }}>
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
            />
            <label htmlFor="terms" style={{ cursor: "pointer" }}>
              Acepto los <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: "none", border: "none", color: "#60a5fa", textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: "0.9rem" }}>Términos y Condiciones</button>
            </label>
          </div>
          
          {errorTerms && (
            <p className="register-error" style={{ marginTop: "-10px", marginBottom: "10px" }}>{errorTerms}</p>
          )}

          {errorGeneral && (
            <p className="register-error register-general-error">
              {errorGeneral}
            </p>
          )}

          <button type="submit" className="register-button" disabled={loading} aria-busy={loading}>
            {loading && <span className="register-spinner" aria-hidden="true" />}
            <span>{loading ? "Creando..." : "crear cuenta"}</span>
          </button>

          <Link to="/login" className="register-link">
            Â¿ya tienes una cuenta?
          </Link>
        </form>
      </div>

      {showTermsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#fff", padding: "24px", borderRadius: "12px", maxWidth: "550px", width: "100%", maxHeight: "85vh", overflowY: "auto", color: "#333", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}>
            <h2 style={{ marginTop: 0, borderBottom: "1px solid #e5e7eb", paddingBottom: "12px", fontSize: "1.5rem" }}>Términos y Condiciones</h2>
            <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "#4b5563" }}>
              <p>Bienvenido al Sistema de Portafolios. Al utilizar nuestra plataforma, usted acepta los siguientes términos:</p>
              
              <h3 style={{ fontSize: "1.1rem", marginTop: "20px", color: "#111827" }}>1. Uso de la Plataforma y Conducta</h3>
              <p>Los usuarios se comprometen a publicar información verídica en sus portafolios (experiencia, educación, proyectos, etc.). Queda estrictamente prohibido el contenido inapropiado, spam, acoso o la infracción de derechos de autor.</p>
              
              <h3 style={{ fontSize: "1.1rem", marginTop: "20px", color: "#111827" }}>2. Moderación y Funciones de Administrador</h3>
              <p>El sistema cuenta con administradores encargados de velar por la integridad de la comunidad. Los administradores tienen la facultad de:</p>
              <ul style={{ paddingLeft: "20px" }}>
                <li>Revisar y gestionar reportes realizados por otros usuarios o visitantes.</li>
                <li><strong>Inhabilitar o suspender cuentas</strong> de manera temporal o permanente si se detectan violaciones a estas normas (ej. perfiles falsos o información maliciosa).</li>
              </ul>
              
              <h3 style={{ fontSize: "1.1rem", marginTop: "20px", color: "#111827" }}>3. Privacidad de Datos</h3>
              <p>La información configurada como "privada" en su portafolio no será expuesta públicamente. Sin embargo, los administradores pueden revisar el estado de las cuentas en caso de reportes para fines de moderación.</p>

              <h3 style={{ fontSize: "1.1rem", marginTop: "20px", color: "#111827" }}>4. Soporte y Contacto</h3>
              <p>Para consultas, aclaraciones sobre la inhabilitación de cuentas o soporte técnico, por favor comuníquese a nuestro correo oficial de referencia: <a href="mailto:Enigmasoftsrl@gmail.com" style={{ color: "#2563eb", textDecoration: "none" }}>Enigmasoftsrl@gmail.com</a>.</p>
            </div>
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
              <button type="button" onClick={() => setShowTermsModal(false)} style={{ background: "#111827", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

export default Register;
