import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./AuthLayout.css";

interface Props {
  backgroundImage: string;
  backTo?: string;
  backLabel?: string;
  children: ReactNode;
}

export default function AuthLayout({
  backgroundImage,
  backTo = "/",
  backLabel = "<-",
  children,
}: Props) {
  return (
    <div className="auth-page">
      <section
        className="auth-frame"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="auth-overlay">
          {backTo && (
            <Link to={backTo} className="auth-back">
              {backLabel}
            </Link>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}
