import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export const registerUser = async (data: {
  nombre_usuario: string;
  correo: string;
  contrasenia: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/register`, data);
  return response.data;
};

export const loginUser = async (data: {
  correo: string;
  contrasenia: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/login`, data);
  return response.data;
};