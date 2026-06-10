import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageLoader from "./ui/PageLoader/PageLoader";

export default function ProfileRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/perfil/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const exists = Boolean(data.has_profile);
        localStorage.setItem("hasProfile", exists ? "true" : "false");
        if (exists) localStorage.setItem("hasPortafolio", "true");
        setHasProfile(exists);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <PageLoader message="Cargando perfil..." />;
  }

  if (!hasProfile) {
    return <Navigate to="/createAccount" />;
  }

  return children;
}
