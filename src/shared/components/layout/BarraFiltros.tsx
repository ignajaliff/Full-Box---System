import type { ReactNode } from "react"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/shared/components/ui/input"

type BarraFiltrosProps = {
  busqueda: string
  onBuscar: (valor: string) => void
  placeholder: string
  /** Rótulo del buscador para lectores de pantalla. */
  etiquetaBusqueda: string
  /** Filtros extra (chips, selects) a la derecha del buscador. */
  children?: ReactNode
  /** Texto del contador (ej. «12 de 30 productos»), alineado a la derecha. */
  contador?: string
}

/**
 * Fila de búsqueda y filtros del estilo CRM: vive fuera de la tarjeta de la
 * tabla, entre los indicadores y el listado.
 */
export function BarraFiltros({
  busqueda,
  onBuscar,
  placeholder,
  etiquetaBusqueda,
  children,
  contador,
}: BarraFiltrosProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative w-[260px]">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={busqueda}
          onChange={(event) => onBuscar(event.target.value)}
          placeholder={placeholder}
          aria-label={etiquetaBusqueda}
          className="h-9 rounded-lg bg-background pl-9 text-[13px]"
        />
      </div>

      {children}

      {contador ? (
        <span className="ml-auto font-mono text-[12.5px] tabular-nums text-muted-foreground">
          {contador}
        </span>
      ) : null}
    </div>
  )
}

type ChipsFiltroProps<T extends string> = {
  /** Opciones disponibles; null se agrega adelante como «Todas». */
  opciones: readonly T[]
  seleccionada: T | null
  onSeleccionar: (opcion: T | null) => void
  etiquetaGrupo: string
  /** Texto del chip que limpia el filtro. */
  etiquetaTodas?: string
  /** Traduce el valor a la etiqueta visible. */
  etiquetaOpcion?: (opcion: T) => string
}

/** Chips redondeados para filtrar por una dimensión (categoría, estado…). */
export function ChipsFiltro<T extends string>({
  opciones,
  seleccionada,
  onSeleccionar,
  etiquetaGrupo,
  etiquetaTodas = "Todas",
  etiquetaOpcion,
}: ChipsFiltroProps<T>) {
  if (opciones.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={etiquetaGrupo}
    >
      {[null, ...opciones].map((opcion) => (
        <button
          key={opcion ?? "todas"}
          type="button"
          onClick={() => onSeleccionar(opcion)}
          aria-pressed={opcion === seleccionada}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors",
            opcion === seleccionada
              // Chip activo neutro: el cartón queda para detalles mínimos.
              ? "border-foreground/20 bg-foreground/[0.06] font-semibold text-foreground"
              : "font-medium text-foreground/70 hover:bg-accent"
          )}
        >
          {opcion === null
            ? etiquetaTodas
            : (etiquetaOpcion?.(opcion) ?? opcion)}
        </button>
      ))}
    </div>
  )
}
