import { Box, Globe, LayoutDashboard, type LucideIcon } from "lucide-react"

import { RUTA_DASHBOARD, RUTA_PRODUCTOS } from "@/app/rutas"

/**
 * Items del navegador lateral. Agregar acá cada módulo nuevo del sistema
 * a medida que se crea su página.
 *
 * `proximamente: true` deja el item visible pero deshabilitado (el módulo
 * todavía no tiene página). Quitar la marca al crear la página del módulo.
 */
export type ItemNavegacion = {
  etiqueta: string
  ruta: string
  icono: LucideIcon
  proximamente?: boolean
}

export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { etiqueta: "Dashboard", ruta: RUTA_DASHBOARD, icono: LayoutDashboard },
  { etiqueta: "Productos", ruta: RUTA_PRODUCTOS, icono: Box },
  { etiqueta: "Web", ruta: "/web", icono: Globe, proximamente: true },
]
