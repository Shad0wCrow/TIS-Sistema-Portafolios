import { useState } from "react"
import styles from "./createAccount-styles.module.css"
import Input from "../../components/ui/Input/input"
import ErrorMessage from "../../components/ui/ErrorMessage/ErrorMessage"
import perfilIcon from "../../assets/icons/icon-perfil.svg"
import Button from "../../components/ui/Button/button"
import { createProfile } from "../../services/profile"
import { useNavigate } from "react-router-dom"

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

    const handleCancelar = () => {
        navigate("/")
    }

    async function handleGuardar() {
        const allTouched = Object.fromEntries(
            (Object.keys(values) as (keyof FormValues)[]).map((k) => [k, true])
        ) as Record<keyof FormValues, boolean>

        setTouched(allTouched)

        const currentErrors = validate(values)
        setErrors(currentErrors)

        if (Object.keys(currentErrors).length === 0) {
            try {
                await createProfile({
                    nombre_perfil: values.nombre,
                    apellido_perfil: values.apellido,
                    profesion: values.profesion,
                    celular: values.celular,
                    descripcion: values.descripcion,
                })
                navigate("/dashboard")
            } catch (error) {
                console.error("Error al guardar perfil:", error)
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
                        <div className={styles.avatar}>
                            <img src={perfilIcon} alt="Avatar" className={styles.avatarIcon} />
                            <Button text="Subir" className={styles.addPhoto} />
                        </div>
                        <div className={styles.avatarInfo}>
                            <span className={styles.avatarHint}>Agregar foto</span>
                            <span className={styles.avatarLabel}>JPG o PNG · máx 5MB</span>
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
                                    <Input
                                        type="text"
                                        placeholder=""
                                        classname={styles.input}
                                        value={values.profesion}
                                        onChange={handleChange("profesion")}
                                        onBlur={handleBlur("profesion")}
                                        error={!!errors.profesion && touched.profesion}
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
                    <span className={styles.actionsHint}>Todos los campos son requeridos</span>
                    <div className={styles.actionsRight}>
                        <Button text="Cancelar" className={styles.cancel} onClick={handleCancelar} />
                        <Button text="Guardar perfil →" className={styles.save} onClick={handleGuardar} />
                    </div>
                </div>

            </div>

        </main>
    )
}