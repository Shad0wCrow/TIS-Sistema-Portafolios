import { useState, type ChangeEvent } from "react"
import styles from "./createAccount-styles.module.css"
import Input from "../../components/ui/Input/input"
import ErrorMessage from "../../components/ui/ErrorMessage/ErrorMessage"
import Button from "../../components/ui/Button/button"
import { createProfile } from "../../services/profile"
import { useNavigate } from "react-router-dom"
import AutocompleteInput from "../../components/ui/AutocompleteInput/AutocompleteInput"
import SuccessModal from "../../components/ui/SuccessModal/SuccessModal"

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

const URL_VALIDA = /^https?:\/\/.+\..+/

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
    }

    if (!values.celular.trim()) {
        errors.celular = "El celular es requerido"
    } else if (!/^\d{7,15}$/.test(values.celular)) {
        errors.celular = "Ingresa un número válido (7-15 dígitos)"
    }

    if (!values.descripcion.trim()) {
        errors.descripcion = "La descripción es requerida"
    } else if (values.descripcion.length > 300) {
        errors.descripcion = "Máximo 300 caracteres"
    }

    return errors
}

function validarFotoUrl(url: string): string | undefined {
    const limpia = url.trim()
    if (!limpia) return undefined
    if (!URL_VALIDA.test(limpia)) return "Ingresa una URL válida que comience con http:// o https://"
    if (limpia.length > 300) return "La URL no puede superar 300 caracteres"
    return undefined
}

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
    const [fotoUrl, setFotoUrl] = useState("")
    const [fotoError, setFotoError] = useState<string | undefined>(undefined)
    const [showSuccess, setShowSuccess] = useState(false)

    function handleChange(field: keyof FormValues) {
        return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    function handleFotoUrlChange(e: ChangeEvent<HTMLInputElement>) {
        const next = e.target.value
        setFotoUrl(next)
        setFotoError(validarFotoUrl(next))
    }

    function handleQuitarFoto() {
        setFotoUrl("")
        setFotoError(undefined)
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
                                <div className={styles.tagNum}>0</div>
                                <span className={styles.tagLabel}>Foto de perfil</span>
                            </div>
                        </div>

                        <div className={styles.sectionCard}>
                            <div className={styles.avatarZone}>
                                <div className={styles.avatarRow}>
                                    <div className={styles.avatar}>
                                        {fotoUrl.trim() ? (
                                            <img
                                                src={fotoUrl.trim()}
                                                alt="Foto de perfil"
                                                className={styles.avatarPreview}
                                                onError={() =>
                                                    setFotoError("La URL no pudo cargarse. Revisa el enlace.")
                                                }
                                            />
                                        ) : (
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className={styles.avatarIconSvg}
                                            >
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className={styles.avatarInfo}>
                                        <label className={styles.label}>URL de foto</label>

                                        <input
                                            className={styles.input}
                                            type="url"
                                            placeholder="https://..."
                                            value={fotoUrl}
                                            onChange={handleFotoUrlChange}
                                        />

                                        {fotoUrl ? (
                                            <button
                                                type="button"
                                                className={styles.quitarFoto}
                                                onClick={handleQuitarFoto}
                                            >
                                                × Quitar foto
                                            </button>
                                        ) : (
                                            <span className={styles.avatarLabel}>
                                                Pega un enlace público de imagen
                                            </span>
                                        )}

                                        <span className={styles.avatarLabel}>
                                            JPG, PNG, WEBP o GIF por URL
                                        </span>

                                        {fotoError && (
                                            <span className={styles.avatarError}>
                                                {fotoError}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
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
        </main>
    )
}