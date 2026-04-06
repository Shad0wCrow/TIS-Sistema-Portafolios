interface Props {
    placeholder: string
    classname: string
    type: string
}

export default function Input({ placeholder, classname, type }: Props) {
    return <input type={type} className={classname} placeholder={placeholder} />
}