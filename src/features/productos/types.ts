import { type Database, type Json } from "@/integrations/supabase/types"

/** Fila de la tabla productos, tipada desde los tipos generados de Supabase. */
export type Producto = Database["public"]["Tables"]["productos"]["Row"]

/** Un tramo de precio por cantidad: desde `cantidad` unidades, cada una vale `precio`. */
export type TramoPrecio = {
  cantidad: number
  precio: number
}

/** Debe coincidir con el tope de `tramos_precio_validos` en la base. */
export const MAX_TRAMOS = 4

/**
 * `tramos_precio` llega como Json genérico (el tipo generado no distingue el
 * contenido), así que se valida la forma antes de usarlo. Devuelve los tramos
 * ordenados por cantidad; lo que no tenga la forma esperada se descarta.
 */
export function leerTramos(json: Json): TramoPrecio[] {
  if (!Array.isArray(json)) return []

  const tramos: TramoPrecio[] = []
  for (const item of json) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      continue
    }
    const { cantidad, precio } = item
    if (typeof cantidad === "number" && typeof precio === "number") {
      tramos.push({ cantidad, precio })
    }
  }

  return tramos.sort((a, b) => a.cantidad - b.cantidad)
}
