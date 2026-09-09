import { type Database } from "@/integrations/supabase/types"

export type Remito = Database["public"]["Tables"]["remitos"]["Row"]
export type ItemRemito = Database["public"]["Tables"]["items_remito"]["Row"]

/** Debe coincidir con el CHECK de estado en la tabla remitos. */
export const ESTADOS_REMITO = [
  "nuevo",
  "preparando",
  "entregado",
  "anulado",
] as const

export type EstadoRemito = (typeof ESTADOS_REMITO)[number]

export const ETIQUETA_ESTADO: Record<EstadoRemito, string> = {
  nuevo: "Nuevo",
  preparando: "Preparando",
  entregado: "Entregado",
  anulado: "Anulado",
}

/**
 * Próximo paso operativo de cada estado. La cadena es
 * nuevo → preparando → entregado; entregado y anulado no avanzan.
 * (La transición real la valida el trigger remitos_validar_transicion.)
 */
export const ESTADO_SIGUIENTE: Partial<Record<EstadoRemito, EstadoRemito>> = {
  nuevo: "preparando",
  preparando: "entregado",
}

/** Badges "pill" suaves del estilo CRM (ver decisiones en CLAUDE.md). */
export const VARIANTE_BADGE_ESTADO: Record<
  EstadoRemito,
  "info-soft" | "warning-soft" | "success-soft" | "muted"
> = {
  nuevo: "info-soft",
  preparando: "warning-soft",
  entregado: "success-soft",
  anulado: "muted",
}

export function esEstadoRemito(valor: string): valor is EstadoRemito {
  return (ESTADOS_REMITO as readonly string[]).includes(valor)
}

/** Número correlativo con formato visible (ej. R-0007). */
export function formatNumeroRemito(numero: number) {
  return `R-${numero.toString().padStart(4, "0")}`
}
