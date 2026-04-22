import { Navigate } from "react-router-dom";

export default function CreateAccountRoute({ children }: any) {
  const token = localStorage.getItem("token");
  const hasProfile = localStorage.getItem("hasProfile") === "true";

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (hasProfile) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
