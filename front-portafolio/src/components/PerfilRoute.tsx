import { Navigate } from "react-router-dom";

export default function PerfilRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const hasProfile = localStorage.getItem("hasProfile") === "true";

  if (!token) return <Navigate to="/login" />;
  if (!hasProfile) return <Navigate to="/createAccount" />;

  return <>{children}</>;
}