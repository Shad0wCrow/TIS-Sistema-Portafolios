import axios from "axios";

const API = "http://localhost:8000/api";

export const createProfile = async (data: {
  nombre_perfil: string;
  apellido_perfil: string;
  profesion: string;
  celular: string;
  descripcion: string;
}) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(`${API}/perfil`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};