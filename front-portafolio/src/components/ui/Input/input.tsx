interface Props {
    placeholder: string
    classname: string
    type: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: () => void
    error?: boolean
    disabled?: boolean
}

export default function Input({ placeholder, classname, type, value, onChange, onBlur, error, disabled }: Props) {
    return (
        <input
            type={type}
            className={`${classname}${error ? " input-error" : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
        />
    )
}