import type { ReactNode } from "react"

import { EncabezadoPagina } from "@/shared/components/layout/EncabezadoPagina"

type PaginaConEncabezadoProps = {
  titulo: string
  descripcion?: ReactNode
  /** Acciones de la página (ej. «Nuevo cliente»), alineadas a la derecha. */
  acciones?: ReactNode
  /** Indicadores, filtros y tarjetas: van sobre el lienzo gris. */
  children: ReactNode
}

/**
 * Estructura estándar de TODA página del sistema (2026-08-17):
 *
 *   · Barra blanca de 64px con el título y las acciones, cerrada por una
 *     línea que continúa la del logo en el sidebar.
 *   · Debajo, el contenido sobre el lienzo gris neutro, donde las tarjetas
 *     blancas se recortan.
 *
 * Usarla en vez de repetir las bandas en cada página.
 */
export function PaginaConEncabezado({
  titulo,
  descripcion,
  acciones,
  children,
}: PaginaConEncabezadoProps) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-hairline bg-background px-6 md:px-7">
        <EncabezadoPagina
          titulo={titulo}
          descripcion={descripcion}
          acciones={acciones}
        />
      </div>

      <div className="flex flex-1 flex-col gap-[18px] bg-lienzo px-6 pb-12 pt-[18px] md:px-7">
        {children}
      </div>
    </div>
  )
}
