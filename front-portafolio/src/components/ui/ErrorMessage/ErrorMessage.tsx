import styles from "./ErrorMessage.module.css"

interface Props {
    message?: string
}

export default function ErrorMessage({ message }: Props) {
    if (!message) return null
    return <span className={styles.error}>{message}</span>
}