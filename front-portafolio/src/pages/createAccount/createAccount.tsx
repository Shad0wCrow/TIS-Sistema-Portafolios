import { useState, type ChangeEvent } from "react"
import styles from "./createAccount-styles.module.css"
import Input from "../../components/ui/Input/input"
import ErrorMessage from "../../components/ui/ErrorMessage/ErrorMessage"
import Button from "../../components/ui/Button/button"
import { createProfile } from "../../services/profile"
import { useNavigate } from "react-router-dom"
import AutocompleteInput from "../../components/ui/AutocompleteInput/AutocompleteInput"
import SuccessModal from "../../components/ui/SuccessModal/SuccessModal"
import ProfilePhotoField from "../SoloPerfil/components/ProfilePhotoField"
import { COUNTRY_PHONE_OPTIONS, getDepartmentsByCountry, getPhonePrefixByCountry } from "../../utils/countryPhoneOptions"

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

const URL_VALIDA = /^(https?:\/\/.+\..+|data:image\/.+)/

export interface ProfileLinkForm {
    titulo: string;
    url: string;
}

interface FormValues {
    nombre: string
    apellido: string
    profesion: string
    celular: string
    descripcion: string
    ciudad: string
    pais: string
    prefijo_celular: string
    correo_contacto: string
}

interface FormErrors {
    nombre?: string
    apellido?: string
    profesion?: string
    celular?: string
    descripcion?: string
    ciudad?: string
    pais?: string
    prefijo_celular?: string
    correo_contacto?: string
    foto?: string
    enlaces?: string
    [key: string]: string | undefined
}

function validate(values: FormValues, enlaces: ProfileLinkForm[]): FormErrors {
    const errors: FormErrors = {}

    if (!values.nombre.trim()) {
        errors.nombre = "El nombre es requerido"
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(values.nombre)) {
        errors.nombre = "Solo se permiten letras"
    }

    if (!values.apellido.trim()) {
        errors.apellido = "El apellido es requerido"
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(values.apellido)) {
        errors.apellido = "Solo se permiten letras"
    }

    if (!values.profesion.trim()) {
        errors.profesion = "La profesión es requerida"
    } else if (/[<>"'`;{}()]/.test(values.profesion)) {
        errors.profesion = "Caracteres no permitidos"
    }

    if (!values.celular.trim()) {
        errors.celular = "El celular es requerido"
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(values.celular)) {
        errors.celular = "Ingresa un número válido (7-20 dígitos)"
    }

    if (!values.descripcion.trim()) {
        errors.descripcion = "La descripción es requerida"
    } else if (/[<>"'`;{}()]/.test(values.descripcion)) {
        errors.descripcion = "Caracteres no permitidos"
    } else if (values.descripcion.length > 300) {
        errors.descripcion = "Máximo 300 caracteres"
    }

    if (values.pais.trim()) {
        if (/[<>"'`;{}()]/.test(values.pais)) {
            errors.pais = "Caracteres no permitidos"
        } else if (values.pais.trim().length > 100) {
            errors.pais = "Máximo 100 caracteres"
        }
    }

    if (!values.pais.trim()) {
        errors.pais = "El pais es requerido"
    } else if (!getPhonePrefixByCountry(values.pais)) {
        errors.pais = "Seleccione un pais de la lista"
    }

    if (!values.ciudad.trim()) {
        errors.ciudad = "Seleccione una ciudad"
    } else if (!getDepartmentsByCountry(values.pais).includes(values.ciudad)) {
        errors.ciudad = "Seleccione una ciudad de la lista"
    }

    if (!values.prefijo_celular.trim()) {
        errors.prefijo_celular = "Seleccione un pais para asignar el prefijo"
    }

    if (!values.celular.trim()) {
        errors.celular = "El celular es requerido"
    } else if (!/^[0-9]{7,14}$/.test(values.celular.trim())) {
        errors.celular = "Ingrese solo numeros, entre 7 y 14 digitos"
    }

    if (values.correo_contacto.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo_contacto.trim())) {
            errors.correo_contacto = "Ingrese un correo válido"
        } else if (!values.correo_contacto.trim().toLowerCase().endsWith("@gmail.com")) {
            errors.correo_contacto = "El correo de contacto debe ser una dirección de @gmail.com"
        }
    }

    enlaces.forEach((enlace, index) => {
        const titulo = enlace.titulo.trim()
        const url = enlace.url.trim()

        if (!titulo && !url) return

        if (!titulo) {
            errors[`enlaces.${index}.titulo`] = "El título es obligatorio"
        } else if (/[<>"'`;{}()]/.test(titulo)) {
            errors[`enlaces.${index}.titulo`] = "Caracteres no permitidos"
        }

        if (!url) {
            errors[`enlaces.${index}.url`] = "La URL es obligatoria"
        } else if (!LINK_URL_VALIDA.test(url)) {
            errors[`enlaces.${index}.url`] = "Debe ser una URL válida (ej: https://...)"
        }
    })

    return errors
}

const LINK_URL_VALIDA = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

function validarFotoUrl(url: string): string | undefined {
    const limpia = url.trim()
    if (!limpia) return undefined
    if (!URL_VALIDA.test(limpia)) return "Ingresa una URL válida que comience con http:// o https://"
    if (limpia.startsWith("data:image/")) return undefined
    if (limpia.length > 300) return "La URL no puede superar 300 caracteres"
    return undefined
}

async function fetchProfesiones(q: string): Promise<string[]> {
    return PROFESIONES.filter((p) =>
        p.toLowerCase().includes(q.toLowerCase())
    )
}

interface CreateAccountProps {
    embedded?: boolean
    onSaved?: () => void
    onCancel?: () => void
}

export default function CreateAccount({ embedded = false, onSaved, onCancel }: CreateAccountProps) {
    const navigate = useNavigate()

    const [values, setValues] = useState<FormValues>({
        nombre: "",
        apellido: "",
        profesion: "",
        celular: "",
        descripcion: "",
        ciudad: "",
        pais: "",
        prefijo_celular: "",
        correo_contacto: "",
    })

    const [enlaces, setEnlaces] = useState<ProfileLinkForm[]>([])
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
    const [saving, setSaving] = useState(false)
    const [fotoUrl, setFotoUrl] = useState("")
    const [fotoError, setFotoError] = useState<string | undefined>(undefined)
    const [showSuccess, setShowSuccess] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    function handleChange(field: keyof FormValues) {
        return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const updated = { ...values, [field]: e.target.value }
            setValues(updated)
            if (touched[field]) {
                setErrors(validate(updated, enlaces))
            }
        }
    }

    function handleBlur(field: keyof FormValues) {
        return () => {
            setTouched((prev) => ({ ...prev, [field]: true }))
            setErrors(validate(values, enlaces))
        }
    }

    function handleFotoUrlChange(next: string) {
        setFotoUrl(next)
        setFotoError(validarFotoUrl(next))
    }

    function handleAdvancedFieldChange(field: "ciudad" | "pais" | "prefijo_celular" | "correo_contacto", value: string) {
        const updated = field === "pais"
            ? { ...values, pais: value, ciudad: "", prefijo_celular: getPhonePrefixByCountry(value) }
            : { ...values, [field]: value }
        setValues(updated)
        setErrors(validate(updated, enlaces))
    }

    function handleLinkChange(index: number, field: keyof ProfileLinkForm, value: string) {
        const updated = enlaces.map((enlace, currentIndex) => (
            currentIndex === index ? { ...enlace, [field]: value } : enlace
        ))
        setEnlaces(updated)
        setErrors(validate(values, updated))
    }

    function handleAddLink() {
        if (enlaces.length >= 8) {
            setErrors((prev) => ({ ...prev, enlaces: "Máximo 8 enlaces personalizados." }))
            return
        }
        setEnlaces((prev) => [...prev, { titulo: "", url: "" }])
    }

    function handleRemoveLink(index: number) {
        const updated = enlaces.filter((_, currentIndex) => currentIndex !== index)
        setEnlaces(updated)
        setErrors(validate(values, updated))
    }

    const handleCancelar = () => {
        if (embedded && onCancel) {
            onCancel()
        } else {
            navigate("/dashboard")
        }
    }

    async function handleGuardar() {
        if (saving) return
        setSubmitError(null)

        const allTouched = Object.fromEntries(
            (Object.keys(values) as (keyof FormValues)[]).map((k) => [k, true])
        ) as Record<keyof FormValues, boolean>

        setTouched(allTouched)

        const currentErrors = validate(values, enlaces)
        setErrors(currentErrors)

        const fotoUrlError = validarFotoUrl(fotoUrl)
        setFotoError(fotoUrlError)

        if (Object.keys(currentErrors).length === 0 && !fotoUrlError) {
            setSaving(true)
            try {
                const cleanLinks = enlaces
                    .map((enlace) => ({
                        titulo: enlace.titulo.trim(),
                        url: enlace.url.trim(),
                    }))
                    .filter((enlace) => enlace.titulo || enlace.url)

                await createProfile({
                    nombre_perfil: values.nombre,
                    apellido_perfil: values.apellido,
                    profesion: values.profesion,
                    celular: values.celular,
                    descripcion: values.descripcion,
                    ciudad: values.ciudad.trim(),
                    pais: values.pais.trim(),
                    prefijo_celular: values.prefijo_celular.trim(),
                    correo_contacto: values.correo_contacto.trim() || undefined,
                    enlaces_personalizados: cleanLinks.length > 0 ? cleanLinks : undefined,
                    foto_url: fotoUrl.trim() || undefined,
                })

                localStorage.setItem("hasProfile", "true")
                setShowSuccess(true)
            } catch (error: any) {
                console.error("Error al guardar perfil:", error)
                const msg = error.response?.data?.message || error.response?.data?.error || "Error al guardar el perfil. Por favor, intenta de nuevo."
                setSubmitError(msg)
            } finally {
                setSaving(false)
            }
        }
    }

    return (
        <main className={`${styles.page} ${embedded ? styles.embedded : ""}`}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTop}>
                    <div className={styles.brand}>
                        <span className={styles.brandTag}>Devfolio</span>
                    </div>
                    <p className={styles.brandName}>Crear perfil</p>
                    <p className={styles.brandSub}>Configuración de cuenta</p>
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
                    <div style={{
                        padding: "16px 20px",
                        background: "#ffffff",
                        border: "1px solid var(--border2)",
                        borderRadius: "10px",
                        marginBottom: "10px"
                    }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "700", color: "var(--accent)" }}>
                            Estás registrando tu perfil por primera vez.
                        </p>
                        <p style={{ margin: "0", fontSize: "12px", color: "var(--text2)" }}>
                            Advertencia: Los campos Nombre, Apellido y Profesión son definitivos y no se podrán cambiar después de guardar el registro.
                        </p>
                    </div>

                    {submitError && (
                        <div style={{
                            padding: "12px 20px",
                            background: "#fde8e8",
                            border: "1px solid #f8b4b4",
                            borderRadius: "10px",
                            marginBottom: "10px",
                            color: "#c81e1e",
                            fontSize: "13px",
                            fontWeight: "600"
                        }}>
                            {submitError}
                        </div>
                    )}

                    <div className={styles.section}>
                        <div className={styles.sectionTag}>
                            <div className={styles.sectionTagLeft}>
                                <div className={styles.tagNum}>0</div>
                                <span className={styles.tagLabel}>Foto de perfil</span>
                            </div>
                        </div>

                        <div className={styles.sectionCard}>
                            <ProfilePhotoField
                                fotoUrl={fotoUrl}
                                error={fotoError}
                                onChange={handleFotoUrlChange}
                                onError={setFotoError}
                            />
                        </div>
                    </div>

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
                                            if (touched.profesion) setErrors(validate(updated, enlaces))
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

                    <div className={styles.section}>
                        <div className={styles.sectionTag}>
                            <div className={styles.sectionTagLeft}>
                                <div className={styles.tagNum}>3</div>
                                <span className={styles.tagLabel}>Ubicación y contacto</span>
                            </div>
                        </div>

                        <div className={styles.sectionCard}>
                            <div className={styles.grid}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>País</label>
                                    <select
                                        className={`${styles.input} ${errors.pais ? styles.inputError : ""}`}
                                        value={values.pais}
                                        onChange={(e) => handleAdvancedFieldChange("pais", e.target.value)}
                                    >
                                        <option value="">Seleccione un pais</option>
                                        {COUNTRY_PHONE_OPTIONS.map((option) => (
                                            <option key={option.country} value={option.country}>
                                                {option.country}
                                            </option>
                                        ))}
                                    </select>
                                    <ErrorMessage message={errors.pais} />
                                </div>

                                <div className={styles.fieldGroup} style={{ display: "none" }}>
                                    <label className={styles.label}>Ciudad</label>
                                    <select
                                        className={`${styles.input} ${errors.ciudad ? styles.inputError : ""}`}
                                        value={values.ciudad}
                                        onChange={(e) => handleAdvancedFieldChange("ciudad", e.target.value)}
                                        disabled={!values.pais}
                                    >
                                        <option value="">
                                            {values.pais ? "Seleccione una ciudad" : "Primero seleccione un pais"}
                                        </option>
                                        {getDepartmentsByCountry(values.pais).map((department) => (
                                            <option key={department} value={department}>
                                                {department}
                                            </option>
                                        ))}
                                    </select>
                                    <ErrorMessage message={errors.ciudad} />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Celular</label>
                                    <div className={styles.phoneRow}>
                                        <span className={styles.phonePrefix}>{values.prefijo_celular}</span>
                                        <Input
                                            type="tel"
                                            placeholder="78937439"
                                            classname={styles.input}
                                            value={values.celular}
                                            onChange={handleChange("celular")}
                                            onBlur={handleBlur("celular")}
                                            error={!!errors.celular && touched.celular}
                                        />
                                    </div>
                                    <ErrorMessage message={errors.prefijo_celular || (touched.celular ? errors.celular : undefined)} />
                                </div>

                                <div className={`${styles.fieldGroup} ${styles.textareaWrapper}`}>
                                    <label className={styles.label}>Correo de contacto</label>
                                    <Input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        classname={styles.input}
                                        value={values.correo_contacto}
                                        onChange={(e) => handleAdvancedFieldChange("correo_contacto", e.target.value)}
                                        error={!!errors.correo_contacto}
                                    />
                                    <ErrorMessage message={errors.correo_contacto} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionTag}>
                            <div className={styles.sectionTagLeft}>
                                <div className={styles.tagNum}>4</div>
                                <span className={styles.tagLabel}>Enlaces personalizados</span>
                            </div>
                            <button
                                type="button"
                                style={{
                                    background: "var(--accent-bg)",
                                    border: "1px solid var(--accent-md)",
                                    color: "var(--accent)",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontFamily: "inherit"
                                }}
                                onClick={handleAddLink}
                            >
                                Agregar enlace
                            </button>
                        </div>

                        <div className={styles.sectionCard}>
                            {errors.enlaces && <ErrorMessage message={errors.enlaces} />}
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {enlaces.length === 0 ? (
                                    <p style={{ margin: "0", fontSize: "12px", color: "var(--text3)", textAlign: "center", padding: "10px 0" }}>
                                        Aún no has agregado enlaces personalizados.
                                    </p>
                                ) : (
                                    enlaces.map((enlace, index) => (
                                        <div key={index} style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1.5fr auto",
                                            gap: "12px",
                                            alignItems: "end",
                                            borderBottom: "1px solid var(--border)",
                                            paddingBottom: "16px"
                                        }}>
                                            <div className={styles.fieldGroup}>
                                                <label className={styles.label}>Título</label>
                                                <input
                                                    className={`${styles.input} ${errors[`enlaces.${index}.titulo`] ? styles.inputError : ""}`}
                                                    value={enlace.titulo}
                                                    onChange={(e) => handleLinkChange(index, "titulo", e.target.value)}
                                                    placeholder="Ej: CV, LinkedIn, GitHub"
                                                    maxLength={80}
                                                />
                                                <ErrorMessage message={errors[`enlaces.${index}.titulo`]} />
                                            </div>

                                            <div className={styles.fieldGroup}>
                                                <label className={styles.label}>URL</label>
                                                <input
                                                    className={`${styles.input} ${errors[`enlaces.${index}.url`] ? styles.inputError : ""}`}
                                                    value={enlace.url}
                                                    onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                                                    placeholder="https://..."
                                                    maxLength={500}
                                                />
                                                <ErrorMessage message={errors[`enlaces.${index}.url`]} />
                                            </div>

                                            <button
                                                type="button"
                                                style={{
                                                    background: "#ffffff",
                                                    border: "1.5px solid var(--border2)",
                                                    color: "var(--red)",
                                                    padding: "8px 12px",
                                                    borderRadius: "7px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    cursor: "pointer",
                                                    height: "38px"
                                                }}
                                                onClick={() => handleRemoveLink(index)}
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.greenAccent} />

                <div className={styles.actions}>
                    <span className={styles.actionsHint}>Completa tu perfil para mostrarlo en tu portafolio.</span>
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
                    onSaved?.()
                    if (!embedded) navigate("/dashboard")
                }}
            />
        </main>
    )
}
