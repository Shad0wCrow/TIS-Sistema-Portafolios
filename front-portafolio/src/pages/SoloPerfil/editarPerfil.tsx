import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./editarperfil.module.css";
import { getPerfilMe, updatePerfil, getSugerenciasProfecion } from "../../services/portafolioservice";
import AutocompleteInput from "../../components/ui/AutocompleteInput/AutocompleteInput";
import Input from "../../components/ui/Input/input";
import PageLoader from "../../components/ui/PageLoader/PageLoader";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import AdvancedProfileSection, { type ProfileLinkForm } from "./components/AdvancedProfileSection";
import ModalSuccess from "../editPortafolio/components/modalSuccess";
import ModalError from "../editPortafolio/components/ModalError";
import ProfilePhotoField from "./components/ProfilePhotoField";
import { DEFAULT_COUNTRY_PHONE, getDepartmentsByCountry, getPhonePrefixByCountry, normalizeDepartmentByCountry } from "../../utils/countryPhoneOptions";

const SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
const SOLO_NUMEROS = /^\+?[0-9\s\-()]{7,20}$/;
const CARACTERES_PELIGROSOS = /[<>"'`;{}()]/;
const URL_VALIDA = /^(https?:\/\/.+\..+|data:image\/.+)/;
const LINK_URL_VALIDA = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
    nombre_perfil: string;
    apellido_perfil: string;
    profesion: string;
    celular: string;
    descripcion: string;
    ciudad: string;
    pais: string;
    prefijo_celular: string;
    correo_contacto: string;
}

interface FormErrors {
    nombre_perfil?: string;
    apellido_perfil?: string;
    profesion?: string;
    celular?: string;
    descripcion?: string;
    ciudad?: string;
    pais?: string;
    prefijo_celular?: string;
    correo_contacto?: string;
    foto?: string;
    [key: string]: string | undefined;
}

interface ProfileSnapshot {
    form: FormState;
    fotoUrl: string;
    enlaces: ProfileLinkForm[];
}

type ConfirmAction = "save" | "discard" | null;

const EMPTY_FORM: FormState = {
    nombre_perfil: "",
    apellido_perfil: "",
    profesion: "",
    celular: "",
    descripcion: "",
    ciudad: "",
    pais: DEFAULT_COUNTRY_PHONE.country,
    prefijo_celular: DEFAULT_COUNTRY_PHONE.prefix,
    correo_contacto: "",
};

function normalizeLinks(enlaces: ProfileLinkForm[]): ProfileLinkForm[] {
    return enlaces
        .map((enlace) => ({
            titulo: enlace.titulo.trim(),
            url: enlace.url.trim(),
        }))
        .filter((enlace) => enlace.titulo || enlace.url);
}

function normalizeSnapshot(form: FormState, fotoUrl: string, enlaces: ProfileLinkForm[]): ProfileSnapshot {
    return {
        form: {
            nombre_perfil: form.nombre_perfil.trim(),
            apellido_perfil: form.apellido_perfil.trim(),
            profesion: form.profesion.trim(),
            celular: form.celular.trim(),
            descripcion: form.descripcion.trim(),
            ciudad: form.ciudad.trim(),
            pais: form.pais.trim(),
            prefijo_celular: form.prefijo_celular.trim(),
            correo_contacto: form.correo_contacto.trim(),
        },
        fotoUrl: fotoUrl.trim(),
        enlaces: normalizeLinks(enlaces),
    };
}

function validar(form: FormState, fotoUrl: string, enlaces: ProfileLinkForm[]): FormErrors {
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
    if (form.pais.trim() && CARACTERES_PELIGROSOS.test(form.pais)) errs.pais = "Caracteres no permitidos.";
    else if (form.pais.trim().length > 100) errs.pais = "Máximo 100 caracteres.";

    if (!form.pais.trim()) {
        errs.pais = "El pais es obligatorio.";
    } else if (!getPhonePrefixByCountry(form.pais)) {
        errs.pais = "Seleccione un pais de la lista.";
    }

    if (!form.ciudad.trim()) {
        errs.ciudad = "Seleccione una ciudad.";
    } else if (!getDepartmentsByCountry(form.pais).includes(form.ciudad)) {
        errs.ciudad = "Seleccione una ciudad de la lista.";
    }

    if (!form.prefijo_celular.trim()) {
        errs.prefijo_celular = "Seleccione un pais para asignar el prefijo.";
    }

    if (!form.celular.trim()) {
        errs.celular = "El telefono es obligatorio.";
    } else if (!/^[0-9]{7,14}$/.test(form.celular.trim())) {
        errs.celular = "Ingrese solo numeros, entre 7 y 14 digitos.";
    }

    if (form.correo_contacto.trim()) {
        if (!EMAIL_VALIDO.test(form.correo_contacto.trim())) {
            errs.correo_contacto = "Ingrese un correo válido.";
        } else if (!form.correo_contacto.trim().toLowerCase().endsWith("@gmail.com")) {
            errs.correo_contacto = "El correo de contacto debe ser una dirección de @gmail.com.";
        }
    }

    enlaces.forEach((enlace, index) => {
        const titulo = enlace.titulo.trim();
        const url = enlace.url.trim();

        if (!titulo && !url) return;

        if (!titulo) errs[`enlaces.${index}.titulo`] = "El título es obligatorio.";
        else if (CARACTERES_PELIGROSOS.test(titulo)) errs[`enlaces.${index}.titulo`] = "Caracteres no permitidos.";

        if (!url) errs[`enlaces.${index}.url`] = "La URL es obligatoria.";
        else if (!LINK_URL_VALIDA.test(url)) errs[`enlaces.${index}.url`] = "Debe ser una URL válida (ej: https://...).";
    });

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

    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const [fotoUrl, setFotoUrl] = useState("");
    const [enlaces, setEnlaces] = useState<ProfileLinkForm[]>([]);
    const [originalProfile, setOriginalProfile] = useState<ProfileSnapshot | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    useEffect(() => {
        getPerfilMe()
            .then((res) => {
                const p = res.perfil;
                if (p) {
                    const loadedPais = p.pais ?? DEFAULT_COUNTRY_PHONE.country;
                    const loadedForm = {
                        nombre_perfil: p.nombre_perfil ?? "",
                        apellido_perfil: p.apellido_perfil ?? "",
                        profesion: p.profesion ?? "",
                        celular: p.celular ?? "",
                        descripcion: p.descripcion ?? "",
                        ciudad: normalizeDepartmentByCountry(loadedPais, p.ciudad),
                        pais: loadedPais,
                        prefijo_celular: p.prefijo_celular ?? (getPhonePrefixByCountry(loadedPais) || DEFAULT_COUNTRY_PHONE.prefix),
                        correo_contacto: p.correo_contacto ?? "",
                    };
                    const loadedFoto = p.foto_url ?? "";
                    const enlacesPerfil = p.enlaces_personalizados ?? p.enlacesPersonalizados ?? [];
                    const loadedLinks = enlacesPerfil.map((enlace: ProfileLinkForm) => ({
                        titulo: enlace.titulo ?? "",
                        url: enlace.url ?? "",
                    }));

                    setForm(loadedForm);
                    setFotoUrl(loadedFoto);
                    setEnlaces(loadedLinks);
                    setOriginalProfile(normalizeSnapshot(loadedForm, loadedFoto, loadedLinks));
                }
            })
            .catch(() => setErrorPage("No se pudo cargar el perfil."))
            .finally(() => setLoadingPage(false));
    }, []);

    const currentSnapshot = useMemo(
        () => normalizeSnapshot(form, fotoUrl, enlaces),
        [form, fotoUrl, enlaces]
    );

    const hasUnsavedChanges = useMemo(() => {
        if (!originalProfile) return false;
        return JSON.stringify(currentSnapshot) !== JSON.stringify(originalProfile);
    }, [currentSnapshot, originalProfile]);

    function handleChange(field: keyof FormState) {
        return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const updated = { ...form, [field]: e.target.value };
            setForm(updated);
            if (touched[field]) setErrors(validar(updated, fotoUrl, enlaces));
        };
    }

    function handleBlur(field: keyof FormState) {
        return () => {
            setTouched((prev) => ({ ...prev, [field]: true }));
            setErrors(validar(form, fotoUrl, enlaces));
        };
    }

    function handleAdvancedFieldChange(field: "ciudad" | "pais" | "prefijo_celular" | "celular" | "correo_contacto", value: string) {
        const updated = field === "pais"
            ? { ...form, pais: value, ciudad: "", prefijo_celular: getPhonePrefixByCountry(value) }
            : { ...form, [field]: value };
        setForm(updated);
        setErrors(validar(updated, fotoUrl, enlaces));
    }

    function handleLinkChange(index: number, field: keyof ProfileLinkForm, value: string) {
        const updated = enlaces.map((enlace, currentIndex) => (
            currentIndex === index ? { ...enlace, [field]: value } : enlace
        ));
        setEnlaces(updated);
        setErrors(validar(form, fotoUrl, updated));
    }

    function handleAddLink() {
        if (enlaces.length >= 8) {
            setErrors((prev) => ({ ...prev, enlaces: "Máximo 8 enlaces personalizados." }));
            return;
        }

        setEnlaces((prev) => [...prev, { titulo: "", url: "" }]);
    }

    function handleRemoveLink(index: number) {
        const updated = enlaces.filter((_, currentIndex) => currentIndex !== index);
        setEnlaces(updated);
        setErrors(validar(form, fotoUrl, updated));
    }

    function handleFotoChange(nextFotoUrl: string) {
        setFotoUrl(nextFotoUrl);
        setErrors(validar(form, nextFotoUrl, enlaces));
    }

    function handleGuardar() {
        if (saving) return;

        const allTouched = Object.fromEntries(
            (Object.keys(form) as (keyof FormState)[]).map((k) => [k, true])
        ) as Record<keyof FormState, boolean>;
        setTouched(allTouched);

        const currentErrors = validar(form, fotoUrl, enlaces);
        setErrors(currentErrors);

        if (Object.keys(currentErrors).length > 0) {
            setConfirmAction(null);
            return;
        }

        if (!hasUnsavedChanges) {
            setSuccessMsg("No hay cambios para guardar.");
            return;
        }

        setConfirmAction("save");
    }

    async function confirmGuardar() {
        if (saving) return;

        const cleanLinks = normalizeLinks(enlaces);
        setSaving(true);
        try {
            await updatePerfil({
                nombre_perfil: form.nombre_perfil.trim(),
                apellido_perfil: form.apellido_perfil.trim(),
                profesion: form.profesion.trim(),
                celular: form.celular.trim(),
                descripcion: form.descripcion.trim(),
                ciudad: form.ciudad.trim() || null,
                pais: form.pais.trim() || null,
                prefijo_celular: form.prefijo_celular.trim() || null,
                correo_contacto: form.correo_contacto.trim() || null,
                foto_url: fotoUrl.trim() || undefined,
                enlaces_personalizados: cleanLinks,
            });
            const savedSnapshot = normalizeSnapshot(form, fotoUrl, cleanLinks);
            setForm(savedSnapshot.form);
            setFotoUrl(savedSnapshot.fotoUrl);
            setEnlaces(savedSnapshot.enlaces);
            setOriginalProfile(savedSnapshot);
            setTouched({});
            setErrors({});
            setConfirmAction(null);
            setSuccessMsg("Perfil actualizado correctamente.");
        } catch {
            setConfirmAction(null);
            setErrorMessage("No se pudo guardar el perfil. Verifica tu conexión e intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    }

    function restoreOriginalProfile() {
        if (!originalProfile) return;

        setForm(originalProfile.form);
        setFotoUrl(originalProfile.fotoUrl);
        setEnlaces(originalProfile.enlaces);
        setErrors({});
        setTouched({});
        setConfirmAction(null);
        setSuccessMsg("Cambios descartados.");
    }

    function handleCancelar() {
        if (saving) return;

        if (hasUnsavedChanges) {
            setConfirmAction("discard");
            return;
        }

        embedded ? onBack?.() : navigate("/dashboard");
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
                        <div style={{
                            padding: "16px 20px",
                            background: "#ffffff",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}>
                            <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "700", color: "var(--accent, #1a6644)" }}>
                                Estás editando tu perfil.
                            </p>
                            <p style={{ margin: "0", fontSize: "12px", color: "var(--text2, #4a5e54)" }}>
                                Los campos Nombre, Apellido y Profesión no se pueden editar porque ya fueron registrados.
                            </p>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>Foto de perfil</span>
                            </div>
                            <ProfilePhotoField
                                fotoUrl={fotoUrl}
                                error={errors.foto}
                                onChange={handleFotoChange}
                                onError={(message) => setErrors((prev) => ({ ...prev, foto: message }))}
                            />
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
                                                if (touched.profesion) setErrors(validar(updated, fotoUrl, enlaces));
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

                        <AdvancedProfileSection
                            ciudad={form.ciudad}
                            pais={form.pais}
                            prefijoCelular={form.prefijo_celular}
                            celular={form.celular}
                            correoContacto={form.correo_contacto}
                            enlaces={enlaces}
                            errors={errors}
                            onFieldChange={handleAdvancedFieldChange}
                            onLinkChange={handleLinkChange}
                            onAddLink={handleAddLink}
                            onRemoveLink={handleRemoveLink}
                        />
                    </div>

                    {/* ── Footer ── */}
                    <div className={styles.footer}>
                        <span className={styles.footerHint}>
                            {Object.keys(errors).length > 0 
                                ? <span style={{ color: "var(--red, #e53e3e)", fontWeight: 500 }}>Hay errores de validación. Revisa los campos.</span>
                                : hasUnsavedChanges
                                    ? "Tienes cambios sin guardar"
                                    : "Los cambios se guardan al presionar el botón"}
                        </span>
                        <div className={styles.footerActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={handleCancelar}
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

            <ConfirmModal
                open={confirmAction === "save"}
                title="Guardar cambios"
                message="Se actualizará tu perfil avanzado y la información quedará visible en tu portafolio público según tu configuración."
                confirmLabel="Guardar"
                cancelLabel="Revisar"
                loading={saving}
                onConfirm={confirmGuardar}
                onCancel={() => setConfirmAction(null)}
            />

            <ConfirmModal
                open={confirmAction === "discard"}
                title="Descartar cambios"
                message="Se perderán los cambios hechos en pantalla y se restaurarán los datos guardados en la base de datos."
                confirmLabel="Descartar"
                cancelLabel="Seguir editando"
                variant="danger"
                onConfirm={restoreOriginalProfile}
                onCancel={() => setConfirmAction(null)}
            />

            {successMsg && (
                <ModalSuccess
                    title="Operación completada"
                    message={successMsg}
                    onClose={() => setSuccessMsg(null)}
                />
            )}

            {errorMessage && (
                <ModalError
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                />
            )}
        </>
    );
}