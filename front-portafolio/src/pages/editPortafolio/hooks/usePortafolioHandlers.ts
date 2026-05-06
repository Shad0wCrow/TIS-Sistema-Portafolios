import { type Dispatch, type SetStateAction } from "react";
import {
  addHabilidad,
  removeHabilidad,
  updateHabilidad,
  addProyecto,
  updateProyecto,
  removeProyecto,
  addExperiencia,
  removeExperiencia,
  updateExperiencia,
  addEducacion,
  removeEducacion,
  addCurso,
  removeCurso,
  addLogro,
  removeLogro,
  addIdioma,
  removeIdioma,
  addCertificacion,
  removeCertificacion
} from "../../../services/portafolioservice";

import type {
  PortafolioData,
  HabilidadCatalogo,
  HabilidadItem,
  Proyecto,
  Experiencia,
  Educacion,
  Curso,
  Logro,
  Idioma,
  Certificacion
} from "../../../types/portafolioTypes";

import { detectarDuplicado } from "../../../utils/detectarDuplicado";

type AlertState = { mensaje: string; onConfirm: () => void } | null;
type ModalProyectoState = Proyecto | null | "nuevo";
type ModalExperienciaState = Experiencia | null | "nueva";

type CertificacionApi = Certificacion & {
  entidad_emisora?: { nombre?: string | null } | null;
  entidadEmisora?: { nombre?: string | null } | null;
  nombre_entidad_emisora?: string | null;
};

type ActiveSection = "perfil" | "habilidades" | "proyectos" | "educacion" | "cursos" | "logros" | "idiomas" | "experiencia" | "certificaciones";

const SECTION_LABELS: Record<ActiveSection, string> = {
  perfil: "Perfil",
  habilidades: "Habilidades",
  proyectos: "Proyectos",
  experiencia: "Experiencia Laboral",
  educacion: "Educación",
  cursos: "Cursos",
  logros: "Logros",
  idiomas: "Idiomas",
  certificaciones: "Certificaciones"
};

const normalizarCertificaciones = (items: CertificacionApi[] = []): Certificacion[] =>
  items.map((cert) => ({
    ...cert,
    nombre_entidad:
      cert.nombre_entidad ??
      cert.entidad_emisora?.nombre ??
      cert.entidadEmisora?.nombre ??
      cert.nombre_entidad_emisora ??
      "",
  }));

interface UsePortafolioHandlersParams {
  data: PortafolioData | null;
  setData: Dispatch<SetStateAction<PortafolioData | null>>;
  catalogo: HabilidadCatalogo[];
  experiencias: Experiencia[];
  setExperiencias: Dispatch<SetStateAction<Experiencia[]>>;
  certificaciones: Certificacion[];
  setCertificaciones: Dispatch<SetStateAction<Certificacion[]>>;
  modalProy: ModalProyectoState;
  modalExp: ModalExperienciaState;
  setModalAlert: Dispatch<SetStateAction<AlertState>>;
  setSuccessMessage: Dispatch<SetStateAction<string | null>>;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  setWarningHabilidad: Dispatch<SetStateAction<string | undefined>>;
  setWarningProyecto: Dispatch<SetStateAction<string | undefined>>;
  setWarningExperiencia: Dispatch<SetStateAction<string | undefined>>;
  setWarningEducacion: Dispatch<SetStateAction<string | undefined>>;
  setWarningCurso: Dispatch<SetStateAction<string | undefined>>;
  setWarningLogro: Dispatch<SetStateAction<string | undefined>>;
  setWarningIdioma: Dispatch<SetStateAction<string | undefined>>;
  setWarningCertificacion: Dispatch<SetStateAction<string | undefined>>;
  refreshData: () => Promise<void>;
}

export function usePortafolioHandlers({
  data,
  setData,
  catalogo,
  experiencias,
  setExperiencias,
  certificaciones,
  setCertificaciones,
  modalProy,
  modalExp,
  setModalAlert,
  setSuccessMessage,
  setErrorMessage,
  setWarningHabilidad,
  setWarningProyecto,
  setWarningExperiencia,
  setWarningEducacion,
  setWarningCurso,
  setWarningLogro,
  setWarningIdioma,
  setWarningCertificacion,
  refreshData,
}: UsePortafolioHandlersParams) {

  const habilidadesTecnicas = data?.habilidades_tecnicas ?? [];
  const habilidadesBlandas  = data?.habilidades_blandas ?? [];
  const proyectos           = data?.proyectos ?? [];
  const educaciones         = (data?.educaciones ?? []) as Educacion[];
  const cursos              = (data?.cursos ?? []) as Curso[];
  const logros              = (data?.logros ?? []) as Logro[];
  const idiomas             = (data?.idiomas ?? []) as Idioma[];

  const handleAddHabilidad = async (habilidadId: number, nivel: string) => {
    const todasHabilidades = [...habilidadesTecnicas, ...habilidadesBlandas];
    const nombre = catalogo.find(h => h.id_habilidad === habilidadId)?.nombre ?? "";

    if (detectarDuplicado(todasHabilidades, { nombre }, ["nombre"])) {
      setWarningHabilidad("Esta habilidad ya está registrada en tu perfil.");
      return false;
    }

    setWarningHabilidad(undefined);
    const res = await addHabilidad({ habilidad_id: habilidadId, nivel });
    const habilidad = res.habilidad;
    const item = {
      id_usuario_habilidad: habilidad.id_usuario_habilidad,
      nombre: habilidad.habilidad?.nombre ?? "",
      nivel: habilidad.nivel ?? null,
    };

    setData((prev) => {
      if (!prev) return prev;
      const key = habilidad.habilidad?.tipo === "tecnica" ? "habilidades_tecnicas" : "habilidades_blandas";
      return { ...prev, [key]: [...prev[key], item] };
    });
    return true;
  };

  const handleEditHabilidad = async (id: number, nivel: string) => {
    const res = await updateHabilidad(id, { nivel });
    const updated = res.habilidad;
    setData((prev) => {
      if (!prev) return prev;
      const mapear = (lista: HabilidadItem[]) =>
        lista.map((h) =>
          h.id_usuario_habilidad === id ? { ...h, nivel: updated.nivel ?? nivel } : h
        );
      return {
        ...prev,
        habilidades_tecnicas: mapear(prev.habilidades_tecnicas),
        habilidades_blandas: mapear(prev.habilidades_blandas),
      };
    });
    setSuccessMessage("El nivel de la habilidad ha sido actualizado correctamente.");
  };

  const handleRemoveHabilidad = async (id: number) => {
    setModalAlert({
      mensaje: "Esta habilidad será eliminada de tu perfil.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeHabilidad(id);
          setData((prev) => prev
            ? {
                ...prev,
                habilidades_tecnicas: prev.habilidades_tecnicas.filter((habilidad) => habilidad.id_usuario_habilidad !== id),
                habilidades_blandas: prev.habilidades_blandas.filter((habilidad) => habilidad.id_usuario_habilidad !== id),
              }
            : prev
          );
          setSuccessMessage("La habilidad ha sido eliminada de tu perfil.");
        } catch (error) {
          setErrorMessage("Error al eliminar la habilidad. Intenta de nuevo");
        }
      },
    });
  };

  const handleSaveProyecto = async (formData: Parameters<typeof addProyecto>[0]) => {
    const proyectosAComparar =
      modalProy && modalProy !== "nuevo"
        ? proyectos.filter((proyecto) => proyecto.id_proyecto !== modalProy.id_proyecto)
        : proyectos;

    if (detectarDuplicado(proyectosAComparar, { titulo: formData.titulo }, ["titulo"])) {
      setWarningProyecto("Ya tienes un proyecto con ese título.");
      return false;
    }

    setWarningProyecto(undefined);
    if (modalProy && modalProy !== "nuevo") {
      const res = await updateProyecto(modalProy.id_proyecto, formData);
      setData((prev) => prev
        ? {
            ...prev,
            proyectos: prev.proyectos.map((proyecto) =>
              proyecto.id_proyecto === modalProy.id_proyecto ? res.proyecto : proyecto
            ),
          }
        : prev
      );
    } else {
      const res = await addProyecto(formData);
      setData((prev) => prev
        ? { ...prev, proyectos: [res.proyecto, ...prev.proyectos] }
        : prev
      );
    }
    return true;
  };

  const handleRemoveProyecto = async (id: number) => {
    setModalAlert({
      mensaje: "Este proyecto será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeProyecto(id);
          setData((prev) => prev
            ? { ...prev, proyectos: prev.proyectos.filter((proyecto) => proyecto.id_proyecto !== id) }
            : prev
          );
          setSuccessMessage("El proyecto ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el proyecto. Intenta de nuevo.");
        }
      },
    });
  };

  const handleSaveExperiencia = async (formData: Parameters<typeof addExperiencia>[0]) => {
    const experienciasAComparar =
      modalExp && modalExp !== "nueva"
        ? experiencias.filter((experiencia) => experiencia.id_experiencia !== modalExp.id_experiencia)
        : experiencias;

    if (detectarDuplicado(experienciasAComparar, { nombre_empresa: formData.nombre_empresa, puesto: formData.puesto }, ["nombre_empresa", "puesto"])) {
      setWarningExperiencia("Ya tienes una experiencia registrada con esa empresa y puesto.");
      return false;
    }

    setWarningExperiencia(undefined);
    if (modalExp && modalExp !== "nueva") {
      await updateExperiencia(modalExp.id_experiencia, formData);
      await refreshData();
    } else {
      const res = await addExperiencia(formData);
      const experiencia = {
        ...res.experiencia,
        nombre_empresa: formData.nombre_empresa,
      };
      setExperiencias((prev) => [experiencia, ...prev]);
    }
    return true;
  };

  const handleRemoveExperiencia = async (id: number) => {
    setModalAlert({
      mensaje: "Esta experiencia laboral será eliminada permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeExperiencia(id);
          setExperiencias((prev) => prev.filter((experiencia) => experiencia.id_experiencia !== id));
          setSuccessMessage("La experiencia laboral ha sido eliminada correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar la experiencia laboral. Intenta de nuevo.");
        }
      },
    });
  };

  const handleSaveEducacion = async (formData: Parameters<typeof addEducacion>[0]) => {
    if (detectarDuplicado(educaciones, { institucion: formData.institucion, titulo: formData.titulo }, ["institucion", "titulo"])) {
      setWarningEducacion("Ya tienes este registro de educación en tu perfil.");
      return false;
    }
    setWarningEducacion(undefined);
    const res = await addEducacion(formData);
    setData((prev) => prev ? { ...prev, educaciones: [res.educacion, ...prev.educaciones] } : prev);
    return true;
  };

  const handleRemoveEducacion = async (id: number) => {
    setModalAlert({
      mensaje: "Este registro de educación será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeEducacion(id);
          setData((prev) => prev
            ? { ...prev, educaciones: prev.educaciones.filter((educacion) => educacion.id_educacion !== id) }
            : prev
          );
          setSuccessMessage("El registro de educación ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el registro de educación. Intenta de nuevo.");
        }
      },
    });
  };

  const handleSaveCurso = async (formData: Parameters<typeof addCurso>[0]) => {
    if (detectarDuplicado(cursos, { titulo: formData.nombre_curso, institucion: formData.institucion }, ["titulo", "institucion"])) {
      setWarningCurso("Ya tienes este curso registrado en tu perfil.");
      return false;
    }
    setWarningCurso(undefined);
    const res = await addCurso(formData);
    setData((prev) => prev ? { ...prev, cursos: [res.curso, ...prev.cursos] } : prev);
    return true;
  };

  const handleRemoveCurso = async (id: number) => {
    setModalAlert({
      mensaje: "Este curso será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeCurso(id);
          setData((prev) => prev
            ? { ...prev, cursos: prev.cursos.filter((curso) => curso.id_educacion !== id) }
            : prev
          );
          setSuccessMessage("El curso ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el curso. Intenta de nuevo.");
        }
      },
    });
  };

  const handleRemoveLogro = async (id: number) => {
    setModalAlert({
      mensaje: "Este logro será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeLogro(id);
          setData((prev) => prev
            ? { ...prev, logros: prev.logros.filter((logro) => logro.id_logro !== id) }
            : prev
          );
          setSuccessMessage("El logro ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el logro. Intenta de nuevo.");
        }
      },
    });
  };

  const handleAddLogro = async (formData: Parameters<typeof addLogro>[0]) => {
    if (detectarDuplicado(logros as any[], { titulo: formData.titulo, entidad_nombre: formData.nombre_entidad }, ["titulo", "entidad_nombre"])) {
      setWarningLogro("Ya tienes este logro registrado en tu perfil.");
      return false;
    }
    setWarningLogro(undefined);
    const res = await addLogro(formData);
    const logro = {
      ...res.logro,
      entidad_nombre: res.logro.entidad_emisora?.nombre ?? res.logro.entidadEmisora?.nombre ?? res.logro.entidad_nombre ?? null,
    };
    setData((prev) => prev ? { ...prev, logros: [logro, ...prev.logros] } : prev);
    return true;
  };

  const handleAddIdioma = async (formData: Parameters<typeof addIdioma>[0]) => {
    if (detectarDuplicado(idiomas as any[], { nombre: formData.nombre_idioma }, ["nombre"])) {
      setWarningIdioma("Ya tienes este idioma registrado en tu perfil.");
      return false;
    }
    setWarningIdioma(undefined);
    const res = await addIdioma(formData);
    const idioma = {
      id_usuario_idioma: res.idioma.id_usuario_idioma,
      nombre: res.idioma.idioma?.nombre ?? formData.nombre_idioma,
      nivel: res.idioma.nivel,
      visibilidad: res.idioma.visibilidad,
    };
    setData((prev) => prev ? { ...prev, idiomas: [...prev.idiomas, idioma] } : prev);
    return true;
  };

  const handleRemoveIdioma = async (id: number) => {
    setModalAlert({
      mensaje: "Este idioma será eliminado permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeIdioma(id);
          setData((prev) => prev
            ? { ...prev, idiomas: prev.idiomas.filter((idioma) => idioma.id_usuario_idioma !== id) }
            : prev
          );
          setSuccessMessage("El idioma ha sido eliminado correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar el idioma. Intenta de nuevo.");
        }
      },
    });
  };

  const handleSaveCertificacion = async (
    formData: Parameters<typeof addCertificacion>[0],
    imagenBase64: string | null
  ) => {
    if (detectarDuplicado(certificaciones as any[], { nombre: formData.nombre, nombre_entidad: formData.nombre_entidad }, ["nombre", "nombre_entidad"])) {
      setWarningCertificacion("Ya tienes esta certificación registrada en tu perfil.");
      return false;
    }
    setWarningCertificacion(undefined);
    const res = await addCertificacion(formData);
    const id = res.certificacion?.id_certificacion;
    if (imagenBase64 && id) {
      const stored = JSON.parse(localStorage.getItem("certificaciones_imagenes") || "{}");
      stored[id] = imagenBase64;
      localStorage.setItem("certificaciones_imagenes", JSON.stringify(stored));
    }
    const certificacion = {
      ...res.certificacion,
      nombre_entidad: formData.nombre_entidad,
      imagen_url: imagenBase64,
    };
    setCertificaciones((prev) => [certificacion, ...prev]);
    return true;
  };

  const handleRemoveCertificacion = async (id: number) => {
    setModalAlert({
      mensaje: "Esta certificación será eliminada permanentemente.",
      onConfirm: async () => {
        setModalAlert(null);
        try {
          await removeCertificacion(id);
          const stored = JSON.parse(localStorage.getItem("certificaciones_imagenes") || "{}");
          delete stored[id];
          localStorage.setItem("certificaciones_imagenes", JSON.stringify(stored));
          setCertificaciones((prev) => prev.filter((certificacion) => certificacion.id_certificacion !== id));
          setSuccessMessage("La certificacion ha sido eliminada correctamente.");
        } catch (error) {
          setErrorMessage("Error al eliminar la certificacion. Intenta de nuevo.");
        }
      },
    });
  };

  return {
    handleAddHabilidad,
    handleEditHabilidad,
    handleRemoveHabilidad,
    handleSaveProyecto,
    handleRemoveProyecto,
    handleSaveExperiencia,
    handleRemoveExperiencia,
    handleSaveEducacion,
    handleRemoveEducacion,
    handleSaveCurso,
    handleRemoveCurso,
    handleRemoveLogro,
    handleAddLogro,
    handleAddIdioma,
    handleRemoveIdioma,
    handleSaveCertificacion,
    handleRemoveCertificacion,
  };
}

export { SECTION_LABELS, normalizarCertificaciones };
export type { AlertState, ModalProyectoState, ModalExperienciaState, ActiveSection, CertificacionApi };
