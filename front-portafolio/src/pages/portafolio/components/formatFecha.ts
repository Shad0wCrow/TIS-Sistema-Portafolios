export function formatFecha(fecha: string | null): string {
  if (!fecha) return "Presente";
  const [y, m] = fecha.split("-");
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${meses[parseInt(m) - 1]} ${y}`;
}
