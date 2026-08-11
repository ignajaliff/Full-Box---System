import { type Database } from "@/integrations/supabase/types"

/** Fila de la tabla clientes, tipada desde los tipos generados de Supabase. */
export type Cliente = Database["public"]["Tables"]["clientes"]["Row"]

/** Debe coincidir con el CHECK de condicion_iva en la tabla clientes. */
export const CONDICIONES_IVA = [
  "Responsable Inscripto",
  "Monotributo",
  "Exento",
  "Consumidor Final",
] as const

export type CondicionIva = (typeof CONDICIONES_IVA)[number]
