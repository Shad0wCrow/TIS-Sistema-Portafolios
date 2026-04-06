import styles from './button.module.css'

interface ButtonProps {
  text: string
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({ text, className, onClick, type = 'button' }: ButtonProps) {
  return (
    <button type={type} className={`${styles.button} ${className ?? ''}`} onClick={onClick}>
      {text}
    </button>
  )
}