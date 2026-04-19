import { Navigate } from "react-router-dom";


export default function PortafolioRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const hasPortafolio = localStorage.getItem("hasPortafolio") === "true";

  if (!token) return <Navigate to="/login" />;
  if (!hasPortafolio) return <Navigate to="/dashboard" />;

  return <>{children}</>;
}