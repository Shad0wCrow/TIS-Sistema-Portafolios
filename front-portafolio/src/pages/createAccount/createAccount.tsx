import { useState } from "react"
import styles from "./createAccount-styles.module.css"
import Input from "../../components/ui/Input/input"
import ErrorMessage from "../../components/ui/ErrorMessage/ErrorMessage"
import perfilIcon from "../../assets/icons/icon-perfil.svg"
import Button from "../../components/ui/Button/button"

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

    function handleGuardar() {
        const allTouched = Object.fromEntries(
            (Object.keys(values) as (keyof FormValues)[]).map((k) => [k, true])
        ) as Record<keyof FormValues, boolean>
        setTouched(allTouched)

        const currentErrors = validate(values)
        setErrors(currentErrors)

        if (Object.keys(currentErrors).length === 0) {
            console.log("Formulario válido:", values)
        }
    }

    return (
        <main className={styles.page}>
            <section className={styles.container}>

                <div className={styles.top}>

                    <div className={styles.left}>
                        <div className={styles.avatar}>
                            <img
                                src={perfilIcon}
                                alt="Avatar"
                                className={styles.avatarIcon}
                            />
                        </div>
                        <Button text="Agregar foto" className={styles.addPhoto} />
                    </div>

                    <div className={styles.right}>

                        <div className={styles.title}>Mi perfil</div>

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
                                <label className={styles.label}>Descripcion</label>
                                <textarea
                                    className={styles.textarea}
                                    value={values.descripcion}
                                    onChange={handleChange("descripcion")}
                                    onBlur={handleBlur("descripcion")}
                                />
                                <ErrorMessage message={touched.descripcion ? errors.descripcion : undefined} />
                            </div>
                        </div>

                    </div>

                </div>

                <div className={styles.actions}>
                    <Button text="Guardar" className={styles.save} onClick={handleGuardar} />
                    <Button text="Cancelar" className={styles.cancel} />
                </div>

            </section>
        </main>
    )
}