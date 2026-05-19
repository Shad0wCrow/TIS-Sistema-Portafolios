import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (user?.rol !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return children;
}
