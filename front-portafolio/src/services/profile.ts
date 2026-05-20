import axios from "axios";
import { dataUrlToBlob } from "./portafolioservice";

const API = "http://localhost:8000/api";

export const createProfile = async (data: {
  nombre_perfil: string;
  apellido_perfil: string;
  profesion: string;
  celular: string;
  descripcion: string;
  foto_url?: string;
}) => {
  const token = localStorage.getItem("token");
  const isDataUrl = data.foto_url?.startsWith("data:image/");

  if (isDataUrl) {
    const formData = new FormData();
    formData.append("nombre_perfil", data.nombre_perfil);
    formData.append("apellido_perfil", data.apellido_perfil);
    formData.append("profesion", data.profesion);
    formData.append("celular", data.celular);
    formData.append("descripcion", data.descripcion);

    const blob = dataUrlToBlob(data.foto_url!);
    const ext = blob.type.split("/")[1] ?? "jpg";
    formData.append("foto_file", blob, `foto.${ext}`);

    const response = await axios.post(`${API}/perfil`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  const response = await axios.post(`${API}/perfil`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
