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
      setErrorTerms("Debe aceptar los términos y condiciones para continuar");
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
              Acepto los <button type="button" onClick={() => setShowTermsModal(true)} style={{ background: "none", border: "none", color: "#10b981", textDecoration: "underline", cursor: "pointer", padding: 0, fontSize: "0.9rem" }}>Términos y Condiciones</button>
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
    backgroundColor: "rgba(16, 185, 129, 0.3)", // Fondo translúcido verde
    backdropFilter: "blur(5px)", // Efecto cristal/desenfoque moderno
    display: "flex", justifyContent: "center", alignItems: "center", 
    zIndex: 1000, padding: "20px",
    fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" // Tipografía limpia
  }}>
    <div style={{
      background: "#ffffff", 
      padding: "32px", 
      borderRadius: "16px", // Bordes más redondeados
      maxWidth: "600px", 
      width: "100%", 
      maxHeight: "85vh", 
      display: "flex", 
      flexDirection: "column",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 15px rgba(0,0,0,0.05)" // Sombra más suave y profunda
    }}>
      
      {/* Cabecera del Modal */}
      <div style={{ borderBottom: "2px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#0f172a", fontWeight: "700" }}>
          Términos y Condiciones
        </h2>
      </div>
      
      
      <div 
        tabIndex={0}
        aria-label="Contenido de los términos y condiciones"
        style={{ fontSize: "0.95rem", lineHeight: "1.7", color: "#475569", overflowY: "auto", paddingRight: "8px" }}
      >
        <p style={{ marginTop: 0 }}>Bienvenido al Sistema de Portafolios. Al utilizar nuestra plataforma, usted acepta los siguientes términos:</p>
        
        <h3 style={{ fontSize: "1.1rem", marginTop: "24px", marginBottom: "8px", color: "#1e293b", fontWeight: "600" }}>
          1. Uso de la Plataforma y Conducta
        </h3>
        <p style={{ margin: 0 }}>Los usuarios se comprometen a publicar información verídica en sus portafolios (experiencia, educación, proyectos, etc.). Queda estrictamente prohibido el contenido inapropiado, el spam, el acoso o la infracción de derechos de autor.</p>
        
        <h3 style={{ fontSize: "1.1rem", marginTop: "24px", marginBottom: "8px", color: "#1e293b", fontWeight: "600" }}>
          2. Moderación y Funciones de Administrador
        </h3>
        <p style={{ margin: 0 }}>El sistema cuenta con administradores encargados de velar por la integridad de la comunidad. Los administradores tienen la facultad de:</p>
        <ul style={{ paddingLeft: "24px", marginTop: "8px", marginBottom: "0" }}>
          <li style={{ marginBottom: "8px" }}>Revisar y gestionar reportes realizados por otros usuarios o visitantes.</li>
          <li><strong>Inhabilitar o suspender cuentas</strong> de manera temporal o permanente si se detectan violaciones a estas normas (contenido inapropiado, spam o publicidad no deseada, perfil falso, suplantación de identidad, información falsa o engañosa, violación de derechos de autor, acoso o comportamiento abusivo, entre otros).</li>
        </ul>
        
        <h3 style={{ fontSize: "1.1rem", marginTop: "24px", marginBottom: "8px", color: "#1e293b", fontWeight: "600" }}>
          3. Privacidad de Datos
        </h3>
        <p style={{ margin: 0 }}>La información configurada como "privada" en su portafolio no será expuesta públicamente. Sin embargo, los administradores pueden revisar el estado de las cuentas y su contenido interno en caso de reportes para fines de moderación y seguridad.</p>

        <h3 style={{ fontSize: "1.1rem", marginTop: "24px", marginBottom: "8px", color: "#1e293b", fontWeight: "600" }}>
          4. Soporte y Contacto
        </h3>
        <p style={{ margin: 0 }}>Para consultas, aclaraciones sobre la inhabilitación de cuentas o soporte técnico, por favor comuníquese a nuestro correo oficial de referencia: <a href="mailto:Enigmasoftsrl@gmail.com?subject=Consulta%20Soporte%20Portafolios" style={{ color: "#10b981", textDecoration: "none", fontWeight: "500" }}>Enigmasoftsrl@gmail.com</a>.</p>
      </div>
      
      {/* Footer del Modal (Botón) */}
      <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", borderTop: "2px solid #f1f5f9", paddingTop: "20px" }}>
        <button 
          type="button" 
          onClick={() => setShowTermsModal(false)} 
          style={{ 
            background: "#10b981", // Verde moderno
            color: "#ffffff", 
            border: "none", 
            padding: "12px 28px", 
            borderRadius: "8px", 
            cursor: "pointer", 
            fontWeight: "600",
            fontSize: "0.95rem",
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -2px rgba(16, 185, 129, 0.2)", // Sombra del botón
            transition: "all 0.2s ease-in-out"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
>
          Entendido
        </button>
      </div>
      
    </div>
  </div>
)}
    </AuthLayout>
  );
}

export default Register;
