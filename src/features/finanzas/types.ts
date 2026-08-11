import { type Database } from "@/integrations/supabase/types"

export type Cobro = Database["public"]["Tables"]["cobros"]["Row"]

/** Debe coincidir con el CHECK de metodo en la tabla cobros. */
export const METODOS_COBRO = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "transferencia", etiqueta: "Transferencia" },
  { valor: "facturado", etiqueta: "Facturado" },
] as const

export type MetodoCobro = (typeof METODOS_COBRO)[number]["valor"]

export function etiquetaMetodo(metodo: string) {
  return (
    METODOS_COBRO.find((opcion) => opcion.valor === metodo)?.etiqueta ?? metodo
  )
}

/** Número correlativo con formato visible (ej. C-0003). */
export function formatNumeroCobro(numero: number) {
  return `C-${numero.toString().padStart(4, "0")}`
}
