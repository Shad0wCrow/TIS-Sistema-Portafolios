import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./editarperfil.module.css";
import { getPortafolio, updatePerfil, getSugerenciasProfecion } from "../../services/portafolioservice";
import AutocompleteInput from "../../components/ui/AutocompleteInput/AutocompleteInput";
import Input from "../../components/ui/Input/input";
import { IconPersona } from "../editPortafolio/components/icons";

const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const SOLO_NUMEROS = /^\+?[0-9\s\-()]{7,20}$/;
const CARACTERES_PELIGROSOS = /[<>"'`;{}()]/;
const URL_VALIDA = /^https?:\/\/.+\..+/;

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
    else if (!SOLO_NUMEROS.test(form.celular.trim())) errs.celular = "Solo números, espacios, +, - o paréntesis (7-20 dígitos).";

    if (!form.descripcion.trim()) errs.descripcion = "La descripción es obligatoria.";
    else if (CARACTERES_PELIGROSOS.test(form.descripcion)) errs.descripcion = "Caracteres no permitidos.";
    else if (form.descripcion.length > 300) errs.descripcion = "Máximo 300 caracteres.";

    const limpiaFoto = fotoUrl.trim();
    if (limpiaFoto && !URL_VALIDA.test(limpiaFoto)) errs.foto = "La URL de foto debe comenzar con http:// o https://.";
    else if (limpiaFoto.length > 300) errs.foto = "La URL de foto no puede superar 300 caracteres.";

    return errs;
}

export default function EditarPerfil() {
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

    function handleFotoUrlChange(e: ChangeEvent<HTMLInputElement>) {
        const next = e.target.value;
        setFotoUrl(next);
        setErrors(validar(form, next));
    }

    function handleQuitarFoto() {
        setFotoUrl("");
        setErrors(validar(form, ""));
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
        return <div className={styles.stateScreen}>Cargando perfil...</div>;
    if (errorPage)
        return <div className={`${styles.stateScreen} ${styles.stateError}`}>{errorPage}</div>;

    return (
        <div className={styles.layout}>
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
                                <div className={styles.fotoCircle}>
                                    {fotoUrl.trim() ? (
                                        <img
                                            src={fotoUrl.trim()}
                                            alt="Foto de perfil"
                                            onError={() => setErrors((prev) => ({ ...prev, foto: "La URL no pudo cargarse. Revisa el enlace." }))}
                                        />
                                    ) : (
                                        <IconPersona />
                                    )}
                                </div>
                            </div>
                            <div className={styles.fotoRight}>
                                <div className={styles.fotoUploadArea}>
                                    <label className={styles.label}>URL de foto</label>
                                    <input
                                        className={styles.input}
                                        type="url"
                                        value={fotoUrl}
                                        onChange={handleFotoUrlChange}
                                        placeholder="https://..."
                                    />
                                    {fotoUrl.trim() && (
                                        <button
                                            className={styles.fotoUploadBtn}
                                            onClick={handleQuitarFoto}
                                            type="button"
                                        >
                                            Quitar foto
                                        </button>
                                    )}
                                    <p className={styles.fotoHint}>Usa una URL pública de imagen para mantenerla sincronizada con el portafolio.</p>
                                    {errors.foto && (
                                        <span className={styles.fotoError}>{errors.foto}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

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

                <div className={styles.footer}>
                    <span className={styles.footerHint}>
                        Los cambios se guardan al presionar el botón
                    </span>
                    <div className={styles.footerActions}>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => navigate("/dashboard")}
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
    );
}
