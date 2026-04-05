import styles from "./registration-styles.module.css"

export default function RegisterPage() {
    return (
        <main className={styles.page}>

            <header className={styles.header}>
                <svg className={styles.headerIcon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 32 L20 8 L32 32" stroke="#4ecdc4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M13 24 L27 24" stroke="#4ecdc4" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                DEVFOLIO
            </header>

            <section className={styles.container}>

                <div className={styles.left}>
                    <div className={styles.avatar}>
                        <svg className={styles.avatarIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="#888"/>
                        </svg>
                    </div>

                    <button className={styles.addPhoto}>
                        Agregar foto
                    </button>
                </div>

                <div className={styles.right}>

                    <div className={styles.title}>
                        Mi perfil
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Nombre</label>
                            <input className={styles.input} />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Apellido</label>
                            <input className={styles.input} />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Profesión</label>
                            <input className={styles.input} />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Celular</label>
                            <input className={styles.input} />
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.textareaWrapper}`}>
                            <label className={styles.label}>Descripcion</label>
                            <textarea className={styles.textarea} />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={`${styles.button} ${styles.save}`}>
                            Guardar
                        </button>

                        <button className={`${styles.button} ${styles.cancel}`}>
                            Cancelar
                        </button>
                    </div>

                </div>

            </section>

        </main>
    )
}