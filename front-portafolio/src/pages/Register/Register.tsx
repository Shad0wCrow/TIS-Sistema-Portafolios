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
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorCorreo("");
    setErrorContrasenia("");
    setErrorGeneral("");

    let hasError = false;

    if (contrasenia.length < 8) {
      setErrorContrasenia("La contraseÃ±a debe tener mas de 8 carÃ¡cteres");
      hasError = true;
    }

    if (!correo.includes("@")) {
      setErrorCorreo("Ingresa un correo vÃ¡lido");
      hasError = true;
    }

    if (hasError) return;

    try {
      const data = await registerUser({
        nombre_usuario,
        correo,
        contrasenia,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("hasPortafolio");
      navigate("/createAccount");
    } catch (err: any) {
      const responseData = err?.response?.data;

      if (responseData?.errors?.correo) {
        setErrorCorreo("ya existe una cuenta con este gmail");
      } else if (responseData?.errors?.contrasenia) {
        setErrorContrasenia("La contraseÃ±a debe tener mas de 8 carÃ¡cteres");
      } else {
        setErrorGeneral("No se pudo crear la cuenta");
      }
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

          {errorGeneral && (
            <p className="register-error register-general-error">
              {errorGeneral}
            </p>
          )}

          <button type="submit" className="register-button">
            crear cuenta
          </button>

          <Link to="/login" className="register-link">
            Â¿ya tienes una cuenta?
          </Link>
        </form>
      </div>
    </AuthLayout>
  );
}

export default Register;
