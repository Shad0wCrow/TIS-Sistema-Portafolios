import apiClient from "../lib/apiClient";

export const registerUser = async (data: {
  nombre_usuario: string;
  correo: string;
  contrasenia: string;
}) => {
  const response = await apiClient.post("/register", data);
  return response.data;
};

export const loginUser = async (data: {
  correo: string;
  contrasenia: string;
}) => {
  const response = await apiClient.post("/login", data);
  return response.data;
};