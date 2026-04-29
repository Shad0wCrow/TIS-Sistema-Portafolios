import apiClient from "../lib/apiClient";

export const createProfile = async (data: {
  nombre_perfil: string;
  apellido_perfil: string;
  profesion: string;
  celular: string;
  descripcion: string;
  foto_url?: string;
}) => {
  
  const response = await apiClient.post("/perfil", data);
  return response.data;
};