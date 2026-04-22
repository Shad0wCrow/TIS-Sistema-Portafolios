import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import styles from "./AutocompleteInput.module.css";

interface AutocompleteInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  fetchSuggestions: (q: string) => Promise<string[]>;
  minChars?: number;
  debounceMs?: number;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  /** Lista estática de opciones (sin petición al backend) */
  staticOptions?: string[];
}

export default function AutocompleteInput({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  fetchSuggestions,
  minChars = 2,
  debounceMs = 300,
  hasError = false,
  disabled = false,
  className,
  staticOptions,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtra o consulta sugerencias
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < minChars) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (staticOptions) {
      const filtered = staticOptions.filter((o) =>
        o.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchSuggestions(value);
        setSuggestions(res);
        setOpen(res.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, minChars, debounceMs, staticOptions]);

  // Cierra al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setActiveIdx(-1);
  };

  const handleSelect = (s: string) => {
    onChange(s);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const handleBlur = () => {
    // Pequeño delay para permitir el click sobre la sugerencia
    setTimeout(() => {
      setOpen(false);
      setActiveIdx(-1);
      onBlur?.();
    }, 150);
  };

  return (
    <div ref={containerRef} className={`${styles.wrapper} ${className ?? ""}`}>
      <input
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        className={`${styles.input} ${hasError ? styles.inputError : ""} ${disabled ? styles.inputDisabled : ""}`}
      />
      {open && suggestions.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === activeIdx}
              className={`${styles.item} ${i === activeIdx ? styles.itemActive : ""}`}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className={styles.itemIcon}>↩</span>
              <span className={styles.itemText}>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
