import { useEffect, useMemo, useState } from "react";
import styles from "./modals.module.css";
import projectStyles from "./projectRow.module.css";
import ProjectRowList from "./projectRowList";
import {
  getGithubConnection,
  getGithubRepos,
  saveGithubUsername,
  addProyecto,
} from "../../../services/portafolioservice";
import type { GithubProyectoImportado, Proyecto } from "../../../types/portafolioTypes";

interface ModalGithubImportProps {
  proyectosExistentes: Proyecto[];
  onClose: () => void;
  onImport: (data: Parameters<typeof addProyecto>[0]) => Promise<boolean | void>;
}

const usernameRegex = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38}[A-Za-z0-9])?$/;

function toProyecto(repo: Omit<GithubProyectoImportado, "id_proyecto">, index: number): GithubProyectoImportado {
  return {
    id_proyecto: -Math.abs(Number(repo.github_id ?? index + 1)),
    github_id: repo.github_id,
    titulo: repo.titulo ?? "",
    descripcion: repo.descripcion ?? "",
    fecha_inicio: repo.fecha_inicio ?? null,
    fecha_fin: repo.fecha_fin ?? null,
    demo_url: repo.demo_url ?? null,
    repositorio_url: repo.repositorio_url ?? null,
    imagen_principal_url: repo.imagen_principal_url ?? null,
    estado: repo.estado ?? "en_progreso",
    roles: repo.roles ?? [],
  };
}

export default function ModalGithubImport({
  proyectosExistentes,
  onClose,
  onImport,
}: ModalGithubImportProps) {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState<GithubProyectoImportado[]>([]);
  const [loadingConnection, setLoadingConnection] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [error, setError] = useState("");
  const [importingUrls, setImportingUrls] = useState<Set<string>>(new Set());
  const [importedUrls, setImportedUrls] = useState<Set<string>>(new Set());

  const existingUrls = useMemo(
    () => new Set(proyectosExistentes.map((p) => p.repositorio_url).filter(Boolean) as string[]),
    [proyectosExistentes]
  );

  const existingTitles = useMemo(
    () => new Set(proyectosExistentes.map((p) => p.titulo.trim().toLowerCase()).filter(Boolean)),
    [proyectosExistentes]
  );

  const allImportedUrls = useMemo(
    () => new Set([...existingUrls, ...importedUrls]),
    [existingUrls, importedUrls]
  );

  const loadRepos = async (nextUsername: string) => {
    const cleanUsername = nextUsername.trim();

    if (!usernameRegex.test(cleanUsername)) {
      setError("Ingresa un usuario de GitHub válido.");
      return;
    }

    setLoadingRepos(true);
    setError("");

    try {
      await saveGithubUsername(cleanUsername);
      const response = await getGithubRepos(cleanUsername);
      setUsername(response.github_username);
      setRepos(response.repositorios.map(toProyecto));
    } catch (err: any) {
      setRepos([]);
      setError(err?.response?.data?.message ?? "No se pudieron cargar los repositorios de GitHub.");
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadConnection = async () => {
      try {
        const connection = await getGithubConnection();
        if (!mounted) return;

        if (connection.github_username) {
          setUsername(connection.github_username);
          await loadRepos(connection.github_username);
        }
      } catch {
        if (mounted) setError("No se pudo revisar la vinculación con GitHub.");
      } finally {
        if (mounted) setLoadingConnection(false);
      }
    };

    loadConnection();

    return () => {
      mounted = false;
    };
  }, []);

  const handleImport = async (proyecto: Proyecto) => {
    const repoUrl = proyecto.repositorio_url;
    const titleKey = proyecto.titulo.trim().toLowerCase();

    if (!repoUrl || allImportedUrls.has(repoUrl)) return;

    if (existingTitles.has(titleKey)) {
      setError("Ya tienes un proyecto registrado con ese título.");
      return;
    }

    setImportingUrls((prev) => new Set(prev).add(repoUrl));
    setError("");

    try {
      const guardado = await onImport({
        titulo: proyecto.titulo,
        descripcion: proyecto.descripcion ?? "",
        fecha_inicio: proyecto.fecha_inicio ?? undefined,
        fecha_fin: proyecto.fecha_fin ?? undefined,
        demo_url: proyecto.demo_url ?? undefined,
        repositorio_url: repoUrl,
        roles: proyecto.roles ?? [],
      });

      if (guardado === false) return;

      setImportedUrls((prev) => new Set(prev).add(repoUrl));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "No se pudo importar el proyecto.");
    } finally {
      setImportingUrls((prev) => {
        const next = new Set(prev);
        next.delete(repoUrl);
        return next;
      });
    }
  };

  const isLoading = loadingConnection || loadingRepos;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalLg}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Importar desde GitHub</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className={styles.modalStack}>
          <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
            <label htmlFor="github-username">Usuario de GitHub</label>
            <div className={styles.inlineFieldAction}>
              <input
                id="github-username"
                name="github_username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="octocat"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.btnSave}
                onClick={() => loadRepos(username)}
                disabled={isLoading}
              >
                {isLoading ? "Cargando..." : "Buscar"}
              </button>
            </div>
          </div>

          {error && <div className={styles.duplicadoWarning}>{error}</div>}

          {isLoading ? (
            <div className={projectStyles.emptyState}>
              <span className={styles.loadingContent}>
                <span className={styles.spinner} aria-hidden="true" />
                Cargando repositorios públicos...
              </span>
            </div>
          ) : repos.length > 0 ? (
            <ProjectRowList
              proyectos={repos}
              onEdit={() => undefined}
              onRemove={() => undefined}
              onAdd={() => undefined}
              importState={{
                importedUrls: allImportedUrls,
                importingUrls,
                onImport: handleImport,
              }}
            />
          ) : (
            <div className={projectStyles.emptyState}>
              <span className={projectStyles.emptyIcon}>GitHub</span>
              <p className={projectStyles.emptyText}>No hay repositorios disponibles.</p>
              <p className={projectStyles.emptySubText}>
                Se omiten forks y repositorios vacíos.
              </p>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
