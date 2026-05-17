import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./editarperfil.module.css";
import { getPortafolio, updatePerfil, getSugerenciasProfecion } from "../../services/portafolioservice";
import AutocompleteInput from "../../components/ui/AutocompleteInput/AutocompleteInput";
import Input from "../../components/ui/Input/input";
import PageLoader from "../../components/ui/PageLoader/PageLoader";
import { IconPersona } from "../editPortafolio/components/icons";

const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const SOLO_NUMEROS = /^\+?[0-9\s\-()]{7,20}$/;
const CARACTERES_PELIGROSOS = /[<>"'`;{}()]/;
const URL_VALIDA = /^(https?:\/\/.+\..+|data:image\/.+)/;

interface FormState {
    nombre_perfil: string;
    apellido_perfil: string;
    profesion: string;
    celular: string;
    descripcion: string;
}

interface FormErrors {
    nombre_perfil?: string;
    apellido_perfil?: string;
    profesion?: string;
    celular?: string;
    descripcion?: string;
    foto?: string;
}

function validar(form: FormState, fotoUrl: string): FormErrors {
    const errs: FormErrors = {};

    if (!form.nombre_perfil.trim()) errs.nombre_perfil = "El nombre es obligatorio.";
    else if (!SOLO_LETRAS.test(form.nombre_perfil.trim())) errs.nombre_perfil = "Solo se permiten letras.";
    else if (form.nombre_perfil.trim().length > 50) errs.nombre_perfil = "Máximo 50 caracteres.";

    if (!form.apellido_perfil.trim()) errs.apellido_perfil = "El apellido es obligatorio.";
    else if (!SOLO_LETRAS.test(form.apellido_perfil.trim())) errs.apellido_perfil = "Solo se permiten letras.";
    else if (form.apellido_perfil.trim().length > 50) errs.apellido_perfil = "Máximo 50 caracteres.";

    if (!form.profesion.trim()) errs.profesion = "La profesión es obligatoria.";
    else if (CARACTERES_PELIGROSOS.test(form.profesion)) errs.profesion = "Caracteres no permitidos.";
    else if (form.profesion.trim().length > 100) errs.profesion = "Máximo 100 caracteres.";

    if (!form.celular.trim()) errs.celular = "El teléfono es obligatorio.";
    else if (!SOLO_NUMEROS.test(form.celular.trim())) errs.celular = "Ingrese un número válido (7-14 dígitos).";

    if (!form.descripcion.trim()) errs.descripcion = "La descripción es obligatoria.";
    else if (CARACTERES_PELIGROSOS.test(form.descripcion)) errs.descripcion = "Caracteres no permitidos.";
    else if (form.descripcion.length > 300) errs.descripcion = "Máximo 300 caracteres.";

    const limpiaFoto = fotoUrl.trim();
    if (limpiaFoto && !URL_VALIDA.test(limpiaFoto)) errs.foto = "La URL de foto debe comenzar con http:// o https://.";
    /*else if (limpiaFoto.length > 100000) errs.foto = "La URL de foto no puede superar 100000 caracteres.";
*/
    return errs;
}

interface EditarPerfilProps {
    embedded?: boolean;
    onBack?: () => void;
}

export default function EditarPerfil({ embedded = false, onBack }: EditarPerfilProps) {
    const navigate = useNavigate();

    const [loadingPage, setLoadingPage] = useState(true);
    const [errorPage, setErrorPage] = useState("");

    const [form, setForm] = useState<FormState>({
        nombre_perfil: "",
        apellido_perfil: "",
        profesion: "",
        celular: "",
        descripcion: "",
    });

    const [fotoUrl, setFotoUrl] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState<"upload" | "url">("upload");
    const [modalUrl, setModalUrl] = useState("");
    const [dragging, setDragging] = useState(false);
    const [modalPreview, setModalPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getPortafolio()
            .then((res) => {
                const p = res.perfil;
                if (p) {
                    setForm({
                        nombre_perfil: p.nombre_perfil ?? "",
                        apellido_perfil: p.apellido_perfil ?? "",
                        profesion: p.profesion ?? "",
                        celular: p.celular ?? "",
                        descripcion: p.descripcion ?? "",
                    });
                    setFotoUrl(p.foto_url ?? "");
                }
            })
            .catch(() => setErrorPage("No se pudo cargar el perfil."))
            .finally(() => setLoadingPage(false));
    }, []);

    function handleChange(field: keyof FormState) {
        return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const updated = { ...form, [field]: e.target.value };
            setForm(updated);
            if (touched[field]) setErrors(validar(updated, fotoUrl));
        };
    }

    function handleBlur(field: keyof FormState) {
        return () => {
            setTouched((prev) => ({ ...prev, [field]: true }));
            setErrors(validar(form, fotoUrl));
        };
    }

    function handleQuitarFoto() {
        setFotoUrl("");
        setErrors(validar(form, ""));
    }

    function handleOpenModal() {
        setModalUrl(fotoUrl);
        setModalPreview(fotoUrl || null);
        setModalTab("upload");
        setDragging(false);
        setModalOpen(true);
    }

    function handleCloseModal() {
        setModalOpen(false);
        setModalUrl("");
        setModalPreview(null);
    }

    function handleModalConfirm() {
    if (modalTab === "url" && modalUrl.trim()) {
        setFotoUrl(modalUrl.trim());
        setErrors(validar(form, modalUrl.trim()));
    } else if (modalTab === "upload" && modalPreview) {
        setFotoUrl(modalPreview);
        setErrors(validar(form, modalPreview));
    }
    setModalOpen(false);
}

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        setDragging(true);
    }

    function handleDragLeave() {
        setDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (ev) => setModalPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (ev) => setModalPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    async function handleGuardar() {
        if (saving) return;

        const allTouched = Object.fromEntries(
            (Object.keys(form) as (keyof FormState)[]).map((k) => [k, true])
        ) as Record<keyof FormState, boolean>;
        setTouched(allTouched);

        const currentErrors = validar(form, fotoUrl);
        setErrors(currentErrors);

        if (Object.keys(currentErrors).length > 0) return;

        setSaving(true);
        try {
            await updatePerfil({
                nombre_perfil: form.nombre_perfil.trim(),
                apellido_perfil: form.apellido_perfil.trim(),
                profesion: form.profesion.trim(),
                celular: form.celular.trim(),
                descripcion: form.descripcion.trim(),
                foto_url: fotoUrl.trim() || undefined,
            });
            setSuccessMsg("Perfil actualizado correctamente.");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch {
            setErrors({ descripcion: "Error al guardar. Intenta de nuevo." });
        } finally {
            setSaving(false);
        }
    }

    if (loadingPage)
        return <PageLoader message="Cargando perfil..." />;
    if (errorPage)
        return <div className={`${styles.stateScreen} ${styles.stateError}`}>{errorPage}</div>;

    return (
        <>
            <div className={`${styles.layout} ${embedded ? styles.embedded : ""}`}>
                <div className={styles.main}>

                    <div className={styles.topbar}>
                        <div className={styles.topbarLeft}>
                            <span className={styles.breadcrumb}>
                                Dashboard
                                <span className={styles.breadcrumbSep}>›</span>
                                <span className={styles.breadcrumbCurrent}>Perfil</span>
                            </span>
                        </div>
                        <div className={styles.topbarRight}>
                            {successMsg && (
                                <span className={styles.statusBadge}>
                                    <span className={styles.statusDot} />
                                    {successMsg}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.content}>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>Foto de perfil</span>
                            </div>
                            <div className={styles.fotoCard}>
                                <div className={styles.fotoLeft}>
                                    <div className={styles.fotoCircleWrap}>
                                        <div className={styles.fotoCircle} onClick={handleOpenModal}>
                                            {fotoUrl.trim() ? (
                                                <img
                                                    src={fotoUrl.trim()}
                                                    alt="Foto de perfil"
                                                    onError={() =>
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            foto: "La URL no pudo cargarse. Revisa el enlace.",
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <IconPersona />
                                            )}
                                            <div className={styles.fotoOverlay}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                    <polyline points="17 8 12 3 7 8"/>
                                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.fotoRight}>
                                    <div className={styles.fotoMeta}>
                                        <p className={styles.fotoTitle}>
                                            {fotoUrl.trim() ? "Foto cargada" : "Sin foto de perfil"}
                                        </p>
                                        <p className={styles.fotoSubtitle}>
                                            {fotoUrl.trim()
                                                ? "Haz clic en la imagen o en el botón para cambiarla."
                                                : "Sube una foto o pega una URL pública para mostrarla en tu portafolio."}
                                        </p>
                                    </div>

                                    <div className={styles.fotoActions}>
                                        <button
                                            className={styles.addFotoBtn}
                                            type="button"
                                            onClick={handleOpenModal}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="17 8 12 3 7 8"/>
                                                <line x1="12" y1="3" x2="12" y2="15"/>
                                            </svg>
                                            {fotoUrl.trim() ? "Cambiar foto" : "Agregar foto"}
                                        </button>

                                        {fotoUrl.trim() && (
                                            <>
                                                <button
                                                    className={styles.fotoRemoveBtn}
                                                    type="button"
                                                    onClick={handleQuitarFoto}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6l-1 14H6L5 6"/>
                                                        <path d="M10 11v6M14 11v6"/>
                                                    </svg>
                                                    Quitar
                                                </button>
                                                <div className={styles.fotoUrlPreview}>
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                                    </svg>
                                                    <span>
                                                        {fotoUrl.trim().length > 38
                                                            ? fotoUrl.trim().slice(0, 38) + "…"
                                                            : fotoUrl.trim()}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {errors.foto && (
                                        <span className={styles.fotoError}>{errors.foto}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Sección datos personales ── */}
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>Datos personales</span>
                            </div>
                            <div className={styles.formCard}>
                                <div className={styles.grid}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>Nombre</label>
                                        <Input
                                            type="text"
                                            placeholder="Tu nombre"
                                            classname={styles.input}
                                            value={form.nombre_perfil}
                                            onChange={handleChange("nombre_perfil")}
                                            onBlur={handleBlur("nombre_perfil")}
                                            error={!!errors.nombre_perfil && touched.nombre_perfil}
                                            disabled
                                        />
                                        {touched.nombre_perfil && errors.nombre_perfil && (
                                            <span className={styles.fieldError}>{errors.nombre_perfil}</span>
                                        )}
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>Apellido</label>
                                        <Input
                                            type="text"
                                            placeholder="Tu apellido"
                                            classname={styles.input}
                                            value={form.apellido_perfil}
                                            onChange={handleChange("apellido_perfil")}
                                            onBlur={handleBlur("apellido_perfil")}
                                            error={!!errors.apellido_perfil && touched.apellido_perfil}
                                            disabled
                                        />
                                        {touched.apellido_perfil && errors.apellido_perfil && (
                                            <span className={styles.fieldError}>{errors.apellido_perfil}</span>
                                        )}
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>Profesión</label>
                                        <AutocompleteInput
                                            name="profesion"
                                            value={form.profesion}
                                            onChange={(v) => {
                                                const updated = { ...form, profesion: v };
                                                setForm(updated);
                                                if (touched.profesion) setErrors(validar(updated, fotoUrl));
                                            }}
                                            onBlur={handleBlur("profesion")}
                                            placeholder="Ej: Ingeniero de Software"
                                            fetchSuggestions={getSugerenciasProfecion}
                                            hasError={!!errors.profesion && !!touched.profesion}
                                            minChars={2}
                                            disabled
                                        />
                                        {touched.profesion && errors.profesion && (
                                            <span className={styles.fieldError}>{errors.profesion}</span>
                                        )}
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>Teléfono</label>
                                        <input
                                            className={`${styles.input} ${errors.celular && touched.celular ? styles.inputError : ""}`}
                                            value={form.celular}
                                            onChange={handleChange("celular")}
                                            onBlur={handleBlur("celular")}
                                            placeholder="+591 7XXXXXXX"
                                            maxLength={20}
                                        />
                                        {touched.celular && errors.celular && (
                                            <span className={styles.fieldError}>{errors.celular}</span>
                                        )}
                                    </div>
                                    <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                                        <label className={styles.label}>Descripción</label>
                                        <textarea
                                            className={`${styles.textarea} ${errors.descripcion && touched.descripcion ? styles.inputError : ""}`}
                                            value={form.descripcion}
                                            onChange={handleChange("descripcion")}
                                            onBlur={handleBlur("descripcion")}
                                            placeholder="Cuéntanos sobre ti y tu trabajo..."
                                            maxLength={300}
                                            rows={4}
                                        />
                                        <div className={styles.charHint}>{form.descripcion.length} / 300</div>
                                        {touched.descripcion && errors.descripcion && (
                                            <span className={styles.fieldError}>{errors.descripcion}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className={styles.footer}>
                        <span className={styles.footerHint}>
                            Los cambios se guardan al presionar el botón
                        </span>
                        <div className={styles.footerActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => embedded ? onBack?.() : navigate("/dashboard")}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleGuardar}
                                disabled={saving}
                            >
                                {saving ? (
                                    <span className={styles.savingContent}>
                                        <span className={styles.spinner} />
                                        Guardando...
                                    </span>
                                ) : (
                                    "Guardar cambios"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modal foto ── */}
            {modalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

                        <div className={styles.modalHeader}>
                            <span className={styles.modalTitle}>Foto de perfil</span>
                            <button className={styles.modalClose} onClick={handleCloseModal} type="button">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        <div className={styles.modalTabs}>
                            <button
                                className={`${styles.modalTab} ${modalTab === "upload" ? styles.modalTabActive : ""}`}
                                onClick={() => setModalTab("upload")}
                                type="button"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                Subir archivo
                            </button>
                            <button
                                className={`${styles.modalTab} ${modalTab === "url" ? styles.modalTabActive : ""}`}
                                onClick={() => setModalTab("url")}
                                type="button"
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                </svg>
                                Desde URL
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {modalTab === "upload" ? (
                                <div
                                    className={`${styles.dropzone} ${dragging ? styles.dropzoneDragging : ""}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleFileSelect}
                                    />
                                    {modalPreview ? (
                                        <div className={styles.dropzonePreview}>
                                            <img src={modalPreview} alt="Vista previa" />
                                            <span className={styles.dropzoneChange}>Haz clic para cambiar</span>
                                        </div>
                                    ) : (
                                        <div className={styles.dropzoneEmpty}>
                                            <div className={styles.dropzoneIcon}>
                                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                    <polyline points="17 8 12 3 7 8"/>
                                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                                </svg>
                                            </div>
                                            <p className={styles.dropzoneText}>Arrastra tu foto aquí</p>
                                            <p className={styles.dropzoneSubtext}>o haz clic para seleccionar · JPG, PNG, WEBP</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.modalUrlTab}>
                                    <label className={styles.modalLabel}>URL de la imagen</label>
                                    <input
                                        className={styles.modalInput}
                                        type="url"
                                        value={modalUrl}
                                        onChange={(e) => {
                                            setModalUrl(e.target.value);
                                            if (URL_VALIDA.test(e.target.value.trim())) {
                                                setModalPreview(e.target.value.trim());
                                            } else {
                                                setModalPreview(null);
                                            }
                                        }}
                                        placeholder="https://ejemplo.com/mi-foto.jpg"
                                        autoFocus
                                    />
                                    {modalPreview && (
                                        <div className={styles.modalUrlPreview}>
                                            <img
                                                src={modalPreview}
                                                alt="Vista previa"
                                                onError={() => setModalPreview(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.modalCancelBtn} onClick={handleCloseModal} type="button">
                                Cancelar
                            </button>
                            <button
                                className={styles.modalConfirmBtn}
                                onClick={handleModalConfirm}
                                type="button"
                                disabled={modalTab === "url" && !modalUrl.trim()}
                            >
                                Aplicar foto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
