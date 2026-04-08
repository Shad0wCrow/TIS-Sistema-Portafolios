import { useNavigate } from "react-router-dom";
import "./Landing.css";
import fondoLanding from "../assets/landing-bg.png";
import logoDevfolio from "../assets/devfolio-logo.png";
import LandingHeader from "../components/layout/LandingHeader";

function Landing() {
  const navigate = useNavigate();
const handleEmpezar = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/api/perfil/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.has_profile) {
      navigate("/dashboard");
    } else {
      navigate("/createAccount");
    }

  } catch (error) {
    console.error("Error verificando perfil:", error);
    navigate("/login");
  }
};
  return (
    <div className="landing-page">
      <section
        className="landing-frame"
        style={{ backgroundImage: `url(${fondoLanding})` }}
      >
        <LandingHeader logoSrc={logoDevfolio} />

        <div className="landing-dark-overlay">
          <div className="landing-content">
            <div className="landing-left">
              <h1 className="landing-title">
                CREA TU
                <br />
                PORTAFOLIO
                <br />
                AQUI
              </h1>

              <p className="landing-subtitle">
                Crea, personaliza, gestiona y publica tu
                <br />
                portafolio con nosotros
              </p>
            </div>

            <div className="landing-right">
              <button
                className="landing-main-button"
                onClick={handleEmpezar}
              >
                EMPEZAR A DESCUBIR
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
