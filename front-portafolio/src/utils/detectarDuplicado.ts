/*
export function detectarDuplicado<T extends Record<string, unknown>>(
  existentes: T[],
  nuevo: Partial<T>,
  campos: (keyof T)[]
): boolean {
  const normalizar = (val: unknown): string =>
    String(val ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  return existentes.some((item) =>
    campos.every(
      (campo) => normalizar(item[campo]) === normalizar(nuevo[campo])
    )
  );
}*/

// Opción 1: más genérica y compatible
export function detectarDuplicado<T>(
  existentes: T[],
  nuevo: Partial<T>,
  campos: (keyof T)[]
): boolean {
  const normalizar = (val: unknown): string =>
    String(val ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  return existentes.some((item) =>
    campos.every(
      (campo) => normalizar(item[campo]) === normalizar(nuevo[campo])
    )
  );
}