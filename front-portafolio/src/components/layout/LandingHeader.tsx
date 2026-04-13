import { Link } from "react-router-dom";
import "./LandingHeader.css";

interface Props {
  logoSrc: string;
  loginTo?: string;
  registerTo?: string;
  loginLabel?: string;
  registerLabel?: string;
}

export default function LandingHeader({
  logoSrc,
  loginTo = "/login",
  registerTo = "/register",
  loginLabel = "Iniciar sesion",
  registerLabel = "Regitrarse",
}: Props) {
  return (
    <header className="landing-navbar">
      <div className="landing-brand">
        <img src={logoSrc} alt="Devfolio" className="landing-brand-logo" />
      </div>

      <nav className="landing-nav">
        <Link to={loginTo} className="landing-login-link">
          {loginLabel}
        </Link>

        <Link to={registerTo} className="landing-register-link">
          {registerLabel}
        </Link>
      </nav>
    </header>
  );
}
