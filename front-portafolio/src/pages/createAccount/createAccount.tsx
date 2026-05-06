import { useState, useRef, type ChangeEvent } from "react"
import styles from "./createAccount-styles.module.css"
import Input from "../../components/ui/Input/input"
import ErrorMessage from "../../components/ui/ErrorMessage/ErrorMessage"
import Button from "../../components/ui/Button/button"
import { createProfile } from "../../services/profile"
import { useNavigate } from "react-router-dom"
import AutocompleteInput from "../../components/ui/AutocompleteInput/AutocompleteInput"
import SuccessModal from "../../components/ui/SuccessModal/SuccessModal";

const PROFESIONES = [
    "Ingeniero de Software",
    "Desarrollador Full Stack",
    "Desarrollador Frontend",
    "Desarrollador Backend",
    "Ingeniero en Informática",
    "Ingeniero en Sistemas",
    "Analista de Sistemas",
    "Arquitecto de Software",
    "Ingeniero DevOps",
    "Especialista en Ciberseguridad",
]

// 🚀 ACTUALIZADO: Para soportar URLs normales y archivos locales (Base64)
const URL_VALIDA = /^(https?:\/\/.+\..+|data:image\/.+)/;

interface FormValues {
    nombre: string
    apellido: string
    profesion: string
    celular: string
    descripcion: string
}

interface FormErrors {
    nombre?: string
    apellido?: string
    profesion?: string
    celular?: string
    descripcion?: string
    foto?: string
}

function validate(values: FormValues): FormErrors {
    const errors: FormErrors = {}

    if (!values.nombre.trim())
        errors.nombre = "El nombre es requerido"
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(values.nombre))
        errors.nombre = "Solo se permiten letras"

    if (!values.apellido.trim())
        errors.apellido = "El apellido es requerido"
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(values.apellido))
        errors.apellido = "Solo se permiten letras"

    if (!values.profesion.trim())
        errors.profesion = "La profesión es requerida"

    if (!values.celular.trim())
        errors.celular = "El celular es requerido"
    else if (!/^\d{7,15}$/.test(values.celular))
        errors.celular = "Ingresa un número válido (7-15 dígitos)"

    if (values.descripcion.length > 300)
        errors.descripcion = "Máximo 300 caracteres"
    else if (!values.descripcion.trim())
        errors.descripcion = "La descripción es requerida"

    return errors
}

// 🚀 ACTUALIZADO: Para manejar tanto enlaces externos como archivos subidos
function validarFotoUrl(url: string): string | undefined {
    const limpia = url.trim()
    if (!limpia) return undefined
    if (!URL_VALIDA.test(limpia)) return "Ingresa una URL válida o sube un archivo."
    if (!limpia.startsWith("data:image/") && limpia.length > 300) return "La URL no puede superar 300 caracteres"
    return undefined
}

// 🔥 FILTRO FRONTEND (sin backend)
async function fetchProfesiones(q: string): Promise<string[]> {
    return PROFESIONES.filter((p) =>
        p.toLowerCase().includes(q.toLowerCase())
    )
}

export default function CreateAccount() {
    const navigate = useNavigate()
    
    const [values, setValues] = useState<FormValues>({
        nombre: "",
        apellido: "",
        profesion: "",
        celular: "",
        descripcion: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
    const [saving, setSaving] = useState(false)
    
    // Estados para la foto principal
    const [fotoUrl, setFotoUrl] = useState("")
    const [fotoError, setFotoError] = useState<string | undefined>(undefined)
    const [showSuccess, setShowSuccess] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    // 🚀 NUEVOS ESTADOS PARA EL MODAL DE FOTO
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState<"upload" | "url">("upload");
    const [modalUrl, setModalUrl] = useState("");
    const [dragging, setDragging] = useState(false);
    const [modalPreview, setModalPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleChange(field: keyof FormValues) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const updated = { ...values, [field]: e.target.value }
            setValues(updated)
            if (touched[field]) {
                setErrors(validate(updated))
            }
        }
    }

    function handleBlur(field: keyof FormValues) {
        return () => {
            setTouched((prev) => ({ ...prev, [field]: true }))
            setErrors(validate(values))
        }
    }

    // 🚀 LÓGICA DEL MODAL
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
        let finalUrl = "";
        if (modalTab === "url" && modalUrl.trim()) {
            finalUrl = modalUrl.trim();
        } else if (modalTab === "upload" && modalPreview) {
            finalUrl = modalPreview;
        }

        setFotoUrl(finalUrl);
        setFotoError(validarFotoUrl(finalUrl));
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
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen no debe superar los 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => setModalPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen no debe superar los 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => setModalPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function handleQuitarFoto() {
        setFotoUrl("");
        setFotoError(undefined);
    }

    const handleCancelar = () => {
        navigate("/dashboard")
    }

    async function handleGuardar() {
        if (saving) return

        const allTouched = Object.fromEntries(
            (Object.keys(values) as (keyof FormValues)[]).map((k) => [k, true])
        ) as Record<keyof FormValues, boolean>

        setTouched(allTouched)

        const currentErrors = validate(values)
        setErrors(currentErrors)
        const fotoUrlError = validarFotoUrl(fotoUrl)
        setFotoError(fotoUrlError)

        // Limpiamos errores previos del servidor antes de intentar de nuevo
        setFotoError(undefined);

        if (Object.keys(currentErrors).length === 0 && !fotoUrlError) {
            setSaving(true)
            try {
                await createProfile({
                    nombre_perfil: values.nombre,
                    apellido_perfil: values.apellido,
                    profesion: values.profesion,
                    celular: values.celular,
                    descripcion: values.descripcion,
                    foto_url: fotoUrl.trim() || undefined,
                })
                localStorage.setItem("hasProfile", "true")
                setShowSuccess(true)
            } catch (error) {
                console.error("Error al guardar perfil:", error)
                // 🔥 AHORA SÍ LE AVISAMOS AL USUARIO SI HAY UN ERROR
                setFotoError("Error al guardar. Si subiste un archivo, puede que sea muy pesado para el servidor. Intenta con una URL.");
            } finally {
                setSaving(false)
            }
        }
    }

    return (
        <main className={styles.page}>

            <aside className={styles.sidebar}>
                <div className={styles.sidebarTop}>
                    <div className={styles.brand}>
                        <span className={styles.brandTag}>Devfolio</span>
                    </div>
                    <p className={styles.brandName}>Crear perfil</p>
                    <p className={styles.brandSub}>Configuración de cuenta</p>
                </div>

                <div className={styles.avatarZone}>
                    <span className={styles.avatarZoneLabel}>Foto de perfil</span>
                    <div className={styles.avatarRow}>
                        <div className={styles.avatar} onClick={handleOpenModal} style={{ cursor: "pointer" }}>
                            {fotoUrl.trim() ? (
                                <img
                                    src={fotoUrl.trim()}
                                    alt="Foto de perfil"
                                    className={styles.avatarPreview}
                                    onError={() => setFotoError("La imagen no pudo cargarse.")}
                                />
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.avatarIconSvg}>
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            )}
                        </div>
                        <div className={styles.avatarInfo}>
                            <button
                                type="button"
                                className={styles.addFotoBtn}
                                onClick={handleOpenModal}
                                style={{ marginBottom: "8px", padding: "6px 12px", cursor: "pointer", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}
                            >
                                {fotoUrl.trim() ? "Cambiar foto" : "Subir o enlazar foto"}
                            </button>
                            
                            {fotoUrl && (
                                <button
                                    type="button"
                                    className={styles.quitarFoto}
                                    onClick={handleQuitarFoto}
                                    style={{ marginLeft: "10px", color: "#e11d48", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                                >
                                    Quitar
                                </button>
                            )}
                            <br />
                            <span className={styles.avatarLabel}>JPG, PNG, WEBP permitidos</span>
                            {fotoError && (
                                <span className={styles.avatarError} style={{ color: "red", display: "block", marginTop: "4px" }}>{fotoError}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.steps}>
                    <span className={styles.stepsLabel}>Pasos</span>

                    <div className={styles.step}>
                        <div className={`${styles.stepNum} ${styles.stepNumDone}`}>✓</div>
                        <div className={styles.stepText}>
                            <div className={styles.stepName}>Cuenta creada</div>
                            <div className={styles.stepDesc}>Email y contraseña</div>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={`${styles.stepNum} ${styles.stepNumActive}`}>2</div>
                        <div className={styles.stepText}>
                            <div className={styles.stepName}>Datos del perfil</div>
                            <div className={styles.stepDesc}>Nombre, profesión, contacto</div>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepNum}>3</div>
                        <div className={styles.stepText}>
                            <div className={`${styles.stepName} ${styles.stepNamePending}`}>Portafolio</div>
                            <div className={styles.stepDesc}>Proyectos y trabajos</div>
                        </div>
                    </div>

                    <div className={styles.step}>
                        <div className={styles.stepNum}>4</div>
                        <div className={styles.stepText}>
                            <div className={`${styles.stepName} ${styles.stepNamePending}`}>Publicar</div>
                            <div className={styles.stepDesc}>Revisa y lanza tu perfil</div>
                        </div>
                    </div>
                </div>

                <div className={styles.sidebarFooter}>
                    <div className={styles.progressLabel}>
                        <span className={styles.progressLabelText}>Progreso</span>
                        <span className={styles.progressLabelStep}>Paso 2 de 4</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} />
                    </div>
                </div>
            </aside>

            <div className={styles.main}>

                <div className={styles.topbar}>
                    <div className={styles.topbarLeft}>
                        <span className={styles.topbarStep}>Paso 2</span>
                        <div className={styles.topbarSep} />
                        <span className={styles.topbarPath}>
                            Configuración →{" "}
                            <span className={styles.topbarPathStrong}>Perfil</span>
                        </span>
                    </div>
                    <div className={styles.topbarRight}>
                        <span className={styles.topbarBadge}>
                            <span className={styles.topbarDot} />
                            Guardado automático
                        </span>
                    </div>
                </div>

                <div className={styles.formBody}>

                    <div className={styles.section}>
                        <div className={styles.sectionTag}>
                            <div className={styles.sectionTagLeft}>
                                <div className={styles.tagNum}>1</div>
                                <span className={styles.tagLabel}>Datos personales</span>
                            </div>
                        </div>
                        <div className={styles.sectionCard}>
                            <div className={styles.grid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Nombre</label>
                                    <Input
                                        type="text"
                                        placeholder=""
                                        classname={styles.input}
                                        value={values.nombre}
                                        onChange={handleChange("nombre")}
                                        onBlur={handleBlur("nombre")}
                                        error={!!errors.nombre && touched.nombre}
                                    />
                                    <ErrorMessage message={touched.nombre ? errors.nombre : undefined} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Apellido</label>
                                    <Input
                                        type="text"
                                        placeholder=""
                                        classname={styles.input}
                                        value={values.apellido}
                                        onChange={handleChange("apellido")}
                                        onBlur={handleBlur("apellido")}
                                        error={!!errors.apellido && touched.apellido}
                                    />
                                    <ErrorMessage message={touched.apellido ? errors.apellido : undefined} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionTag}>
                            <div className={styles.sectionTagLeft}>
                                <div className={styles.tagNum}>2</div>
                                <span className={styles.tagLabel}>Información profesional</span>
                            </div>
                        </div>
                        <div className={styles.sectionCard}>
                            <div className={styles.grid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Profesión</label>
                                    <AutocompleteInput
                                        name="profesion"
                                        value={values.profesion}
                                        onChange={(v) => {
                                            const updated = { ...values, profesion: v }
                                            setValues(updated)
                                            if (touched.profesion) setErrors(validate(updated))
                                        }}
                                        onBlur={handleBlur("profesion")}
                                        placeholder="Ej: Ingeniero de Software"
                                        fetchSuggestions={fetchProfesiones}
                                        staticOptions={PROFESIONES}
                                        hasError={!!errors.profesion && touched.profesion}
                                        minChars={1}
                                    />
                                    <ErrorMessage message={touched.profesion ? errors.profesion : undefined} />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Celular</label>
                                    <Input
                                        type="tel"
                                        placeholder=""
                                        classname={styles.input}
                                        value={values.celular}
                                        onChange={handleChange("celular")}
                                        onBlur={handleBlur("celular")}
                                        error={!!errors.celular && touched.celular}
                                    />
                                    <ErrorMessage message={touched.celular ? errors.celular : undefined} />
                                </div>
                                <div className={`${styles.fieldGroup} ${styles.textareaWrapper}`}>
                                    <label className={styles.label}>Descripción</label>
                                    <textarea
                                        className={styles.textarea}
                                        value={values.descripcion}
                                        onChange={handleChange("descripcion")}
                                        onBlur={handleBlur("descripcion")}
                                        placeholder="Cuéntanos sobre ti y tu trabajo..."
                                    />
                                    <div className={styles.charHint}>
                                        {values.descripcion.length} / 300
                                    </div>
                                    <ErrorMessage message={touched.descripcion ? errors.descripcion : undefined} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className={styles.greenAccent} />

                {globalError && (
                    <div style={{ color: "#e53e3e", padding: "12px 32px", fontSize: "14px", fontWeight: 500, backgroundColor: "#fff5f5", borderLeft: "4px solid #e53e3e", marginBottom: "16px", marginLeft: "32px", marginRight: "32px", borderRadius: "4px" }}>
                        {globalError}
                    </div>
                )}

                <div className={styles.actions}>
                    <span className={styles.actionsHint}>Puedes omitir este paso y crear tu perfil después</span>
                    <div className={styles.actionsRight}>
                        <Button text="Omitir" className={styles.cancel} onClick={handleCancelar} />
                        <Button
                            text="Guardar perfil →"
                            loadingText="Guardando..."
                            className={styles.save}
                            onClick={handleGuardar}
                            loading={saving}
                        />
                    </div>
                </div>

            </div>

            <SuccessModal
                open={showSuccess}
                onClose={() => {
                    setShowSuccess(false)
                    navigate("/dashboard")
                }}
            />

            {/* ── MODAL FOTO REPLICADO ── */}
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

        </main>
    )
}