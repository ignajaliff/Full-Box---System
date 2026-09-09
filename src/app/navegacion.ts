import {
  Box,
  FileText,
  Globe,
  LayoutDashboard,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import {
  RUTA_CLIENTES,
  RUTA_DASHBOARD,
  RUTA_FINANZAS,
  RUTA_FINANZAS_HISTORIAL,
  RUTA_FINANZAS_PENDIENTES,
  RUTA_PRODUCTOS,
  RUTA_REMITOS,
} from "@/app/rutas"

/**
 * Items del navegador lateral. Agregar acá cada módulo nuevo del sistema
 * a medida que se crea su página.
 *
 * `proximamente: true` deja el item visible pero deshabilitado (el módulo
 * todavía no tiene página). Quitar la marca al crear la página del módulo.
 *
 * `subitems` despliega las subpáginas del módulo debajo del item cuando la
 * ruta está activa. La ruta del padre debe redirigir a la primera subpágina.
 */
export type SubitemNavegacion = {
  etiqueta: string
  ruta: string
}

export type ItemNavegacion = {
  etiqueta: string
  ruta: string
  icono: LucideIcon
  proximamente?: boolean
  subitems?: SubitemNavegacion[]
}

export const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { etiqueta: "Dashboard", ruta: RUTA_DASHBOARD, icono: LayoutDashboard },
  { etiqueta: "Productos", ruta: RUTA_PRODUCTOS, icono: Box },
  { etiqueta: "Remitos", ruta: RUTA_REMITOS, icono: FileText },
  { etiqueta: "Clientes", ruta: RUTA_CLIENTES, icono: Users },
  {
    etiqueta: "Finanzas",
    ruta: RUTA_FINANZAS,
    icono: Wallet,
    subitems: [
      { etiqueta: "Historial de cobros", ruta: RUTA_FINANZAS_HISTORIAL },
      { etiqueta: "Pendientes de cobro", ruta: RUTA_FINANZAS_PENDIENTES },
    ],
  },
  { etiqueta: "Web", ruta: "/web", icono: Globe, proximamente: true },
]
