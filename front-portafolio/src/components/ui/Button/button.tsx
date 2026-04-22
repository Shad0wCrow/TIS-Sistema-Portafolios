import styles from './button.module.css'

interface ButtonProps {
  text: string
  className?: string
  onClick?: () => void | Promise<void>
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  loadingText?: string
  disabled?: boolean
}

export default function Button({
  text,
  className,
  onClick,
  type = 'button',
  loading = false,
  loadingText,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${className ?? ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span>{loading ? loadingText ?? text : text}</span>
    </button>
  )
}
