import axios from "axios";

// La URL base se lee desde la variable de entorno VITE_API_URL.
// Si no está definida (ej. en desarrollo local sin .env), usa el fallback.
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE,
});

// Interceptor: inyecta el token Bearer en cada request automáticamente.
// No es necesario pasar headers manualmente en ningún servicio.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;