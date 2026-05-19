import styles from "../editarperfil.module.css";

export interface ProfileLinkForm {
    titulo: string;
    url: string;
}

interface AdvancedProfileSectionProps {
    ciudad: string;
    pais: string;
    correoContacto: string;
    enlaces: ProfileLinkForm[];
    errors: Record<string, string | undefined>;
    onFieldChange: (field: "ciudad" | "pais" | "correo_contacto", value: string) => void;
    onLinkChange: (index: number, field: keyof ProfileLinkForm, value: string) => void;
    onAddLink: () => void;
    onRemoveLink: (index: number) => void;
}

export default function AdvancedProfileSection({
    ciudad,
    pais,
    correoContacto,
    enlaces,
    errors,
    onFieldChange,
    onLinkChange,
    onAddLink,
    onRemoveLink,
}: AdvancedProfileSectionProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Perfil avanzado</span>
            </div>
            <div className={styles.formCard}>
                <div className={styles.grid}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Ciudad</label>
                        <input
                            className={`${styles.input} ${errors.ciudad ? styles.inputError : ""}`}
                            value={ciudad}
                            onChange={(event) => onFieldChange("ciudad", event.target.value)}
                            placeholder="Ej: Cochabamba"
                            maxLength={100}
                        />
                        {errors.ciudad && <span className={styles.fieldError}>{errors.ciudad}</span>}
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Pais</label>
                        <input
                            className={`${styles.input} ${errors.pais ? styles.inputError : ""}`}
                            value={pais}
                            onChange={(event) => onFieldChange("pais", event.target.value)}
                            placeholder="Ej: Bolivia"
                            maxLength={100}
                        />
                        {errors.pais && <span className={styles.fieldError}>{errors.pais}</span>}
                    </div>

                    <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                        <label className={styles.label}>Correo de contacto</label>
                        <input
                            className={`${styles.input} ${errors.correo_contacto ? styles.inputError : ""}`}
                            value={correoContacto}
                            onChange={(event) => onFieldChange("correo_contacto", event.target.value)}
                            placeholder="correo@ejemplo.com"
                            type="email"
                            maxLength={255}
                        />
                        {errors.correo_contacto && <span className={styles.fieldError}>{errors.correo_contacto}</span>}
                    </div>
                </div>

                <div className={styles.linksHeader}>
                    <div>
                        <span className={styles.linksTitle}>Enlaces personalizados</span>
                        <p className={styles.linksHint}>Agrega recursos externos como CV, redes profesionales o sitio personal.</p>
                    </div>
                    <button className={styles.addLinkBtn} type="button" onClick={onAddLink}>
                        Agregar enlace
                    </button>
                </div>
                {errors.enlaces && <span className={styles.fieldError}>{errors.enlaces}</span>}

                <div className={styles.linksList}>
                    {enlaces.length === 0 ? (
                        <p className={styles.linksEmpty}>Aun no agregaste enlaces personalizados.</p>
                    ) : (
                        enlaces.map((enlace, index) => (
                            <div className={styles.linkRow} key={index}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Titulo</label>
                                    <input
                                        className={`${styles.input} ${errors[`enlaces.${index}.titulo`] ? styles.inputError : ""}`}
                                        value={enlace.titulo}
                                        onChange={(event) => onLinkChange(index, "titulo", event.target.value)}
                                        placeholder="Ej: CV, LinkedIn, GitHub"
                                        maxLength={80}
                                    />
                                    {errors[`enlaces.${index}.titulo`] && (
                                        <span className={styles.fieldError}>{errors[`enlaces.${index}.titulo`]}</span>
                                    )}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>URL</label>
                                    <input
                                        className={`${styles.input} ${errors[`enlaces.${index}.url`] ? styles.inputError : ""}`}
                                        value={enlace.url}
                                        onChange={(event) => onLinkChange(index, "url", event.target.value)}
                                        placeholder="https://..."
                                        type="url"
                                        maxLength={500}
                                    />
                                    {errors[`enlaces.${index}.url`] && (
                                        <span className={styles.fieldError}>{errors[`enlaces.${index}.url`]}</span>
                                    )}
                                </div>
                                <button
                                    className={styles.removeLinkBtn}
                                    type="button"
                                    onClick={() => onRemoveLink(index)}
                                    aria-label="Eliminar enlace"
                                >
                                    Quitar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
