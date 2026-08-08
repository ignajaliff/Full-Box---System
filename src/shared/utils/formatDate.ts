const formateador = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

/**
 * Formato de fecha centralizado del sistema (ej. "05 ago 2026").
 * Recibe el timestamp ISO que devuelve Supabase.
 */
export function formatDate(iso: string) {
  return formateador.format(new Date(iso))
}
