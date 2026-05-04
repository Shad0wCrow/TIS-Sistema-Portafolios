import type {
  Certificacion,
  ConfiguracionSecciones,
  Experiencia,
  PortafolioData,
} from "../../../types/portafolioTypes";

// ── Types ────────────────────────────────────────────────────────────────────

type PreviewSnapshot = {
  data: PortafolioData | null;
  experiencias: Experiencia[];
  certificaciones: Certificacion[];
  updatedAt: string;
};

const DEFAULT_SECTION_ORDER = [
  "perfil",
  "habilidades",
  "proyectos",
  "educacion",
  "experiencia",
  "cursos",
  "certificaciones",
  "logros",
  "idiomas",
] as const;

type SectionId = (typeof DEFAULT_SECTION_ORDER)[number];

// ── Constants ────────────────────────────────────────────────────────────────

const PREVIEW_CACHE_KEY = "portafolio_preview_cache";
const SECTION_ORDER_KEY = "portafolio_section_order";

const NIVEL_IDIOMA: Record<string, string> = {
  a1: "A1 - Principiante",
  a2: "A2 - Elemental",
  b1: "B1 - Intermedio",
  b2: "B2 - Intermedio alto",
  c1: "C1 - Avanzado",
  c2: "C2 - Maestría",
  nativo: "Nativo",
};

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const DEFAULTS_SECCIONES: ConfiguracionSecciones = {
  seccion_perfil: "publico",
  seccion_habilidades: "publico",
  seccion_proyectos: "publico",
  seccion_educacion: "publico",
  seccion_experiencia: "publico",
  seccion_cursos: "publico",
  seccion_certificaciones: "publico",
  seccion_logros: "publico",
  seccion_idiomas: "publico",
};

const SECTION_LABELS: Record<SectionId, string> = {
  perfil: "Perfil profesional",
  habilidades: "Habilidades",
  proyectos: "Proyectos",
  educacion: "Formación académica",
  experiencia: "Experiencia laboral",
  cursos: "Cursos",
  certificaciones: "Certificaciones",
  logros: "Logros y reconocimientos",
  idiomas: "Idiomas",
};

const SECTION_CONFIG_KEYS: Record<SectionId, keyof ConfiguracionSecciones> = {
  perfil: "seccion_perfil",
  habilidades: "seccion_habilidades",
  proyectos: "seccion_proyectos",
  educacion: "seccion_educacion",
  experiencia: "seccion_experiencia",
  cursos: "seccion_cursos",
  certificaciones: "seccion_certificaciones",
  logros: "seccion_logros",
  idiomas: "seccion_idiomas",
};

// ── Helper functions ─────────────────────────────────────────────────────────

function isSectionPublic(id: SectionId, cfg: ConfiguracionSecciones): boolean {
  return cfg[SECTION_CONFIG_KEYS[id]] === "publico";
}

function loadSectionOrder(): SectionId[] {
  try {
    const raw = localStorage.getItem(SECTION_ORDER_KEY);
    if (!raw) return [...DEFAULT_SECTION_ORDER];
    const ids = JSON.parse(raw) as SectionId[];
    const valid = ids.filter((id) => (DEFAULT_SECTION_ORDER as readonly string[]).includes(id));
    const missing = DEFAULT_SECTION_ORDER.filter((id) => !valid.includes(id));
    return [...valid, ...missing] as SectionId[];
  } catch {
    return [...DEFAULT_SECTION_ORDER];
  }
}

function saveSectionOrder(order: SectionId[]) {
  try {
    localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore storage errors
  }
}

function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return "Presente";
  const parts = fecha.split("-");
  if (parts.length < 2) return fecha;
  const year = parts[0];
  const monthIndex = Number(parts[1]) - 1;
  const month = MESES[monthIndex] ?? parts[1];
  return `${month} ${year}`;
}

function formatPeriodo(inicio?: string | null, fin?: string | null): string {
  if (!inicio && !fin) return "Sin fechas";
  return `${formatFecha(inicio)} — ${fin ? formatFecha(fin) : "Presente"}`;
}

function readPreviewCache(): PreviewSnapshot | null {
  try {
    const raw = localStorage.getItem(PREVIEW_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviewSnapshot;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export {
  NIVEL_IDIOMA,
  DEFAULTS_SECCIONES,
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  SECTION_CONFIG_KEYS,
  isSectionPublic,
  loadSectionOrder,
  saveSectionOrder,
  formatFecha,
  formatPeriodo,
  readPreviewCache,
};

export type { SectionId, PreviewSnapshot };
