interface Props {
    placeholder: string
    classname: string
    type: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: () => void
    error?: boolean
}

export default function Input({ placeholder, classname, type, value, onChange, onBlur, error }: Props) {
    return (
        <input
            type={type}
            className={`${classname}${error ? " input-error" : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    )
}