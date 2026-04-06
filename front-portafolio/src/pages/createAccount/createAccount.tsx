import styles from "./createAccount-styles.module.css"
import Input from "../../components/ui/Input/input"
import perfilIcon from "../../assets/icons/icon-perfil.svg"
import Button from "../../components/ui/Button/button"

export default function createAccount() {
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

                        <div className={styles.title}>
                            Mi perfil
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Nombre</label>
                                <Input type="text" placeholder="" classname={styles.input} />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Apellido</label>
                                <Input type="text" placeholder="" classname={styles.input} />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Profesión</label>
                                <Input type="text" placeholder="" classname={styles.input} />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Celular</label>
                                <Input type="tel" placeholder="" classname={styles.input} />
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.textareaWrapper}`}>
                                <label className={styles.label}>Descripcion</label>
                                <textarea className={styles.textarea} />
                            </div>
                        </div>

                    </div>

                </div>

                <div className={styles.actions}>
                    <Button text="Guardar" className={styles.save} />
                    <Button text="Cancelar" className={styles.cancel} />
                </div>

            </section>

        </main>
    )
}