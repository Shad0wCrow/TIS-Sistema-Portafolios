import axios from "axios";

const API = "http://localhost:8000/api";

export const registerUser = async (data: {
  nombre_usuario: string;
  correo: string;
  contrasenia: string;
}) => {
  const response = await axios.post(`${API}/register`, data);
  return response.data;
};

export const loginUser = async (data: {
  correo: string;
  contrasenia: string;
}) => {
  const response = await axios.post(`${API}/login`, data);
  return response.data;
};