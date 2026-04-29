import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../lib/apiClient";

export default function ProfileRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // apiClient inyecta el token automáticamente via interceptor
        const { data } = await apiClient.get("/perfil/me");
        setHasProfile(data.has_profile);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!hasProfile) {
    return <Navigate to="/createAccount" />;
  }

  return <>{children}</>;
}