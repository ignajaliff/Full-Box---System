import { cn } from "@/lib/utils"
import { Skeleton } from "@/shared/components/ui/skeleton"

export type Indicador = {
  etiqueta: string
  /** Ya formateado (moneda, contador, etc.): se muestra tal cual, en mono. */
  valor: string
  detalle?: string
}

type FilaIndicadoresProps = {
  indicadores: Indicador[]
  /** Rótulo del bloque para lectores de pantalla. */
  etiquetaAccesible: string
}

/**
 * Fila de indicadores del estilo CRM: un solo contenedor con divisores
 * internos (no tarjetas sueltas) y las cifras en mono + tabular-nums.
 */
export function FilaIndicadores({
  indicadores,
  etiquetaAccesible,
}: FilaIndicadoresProps) {
  return (
    <section
      aria-label={etiquetaAccesible}
      className="grid grid-cols-2 overflow-hidden rounded-xl border bg-surface lg:grid-cols-4"
    >
      {indicadores.map((indicador, indice) => (
        <div
          key={indicador.etiqueta}
          className={cn(
            "flex flex-col gap-1.5 border-hairline p-4",
            // En 2 columnas: borde derecho en los pares, inferior en la
            // primera fila. En 4 columnas: solo el borde derecho.
            indice % 2 === 0 && "max-lg:border-r",
            indice < 2 && "max-lg:border-b",
            "lg:border-r lg:last:border-r-0"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {indicador.etiqueta}
          </span>
          <span className="font-mono text-[21px] font-semibold tabular-nums tracking-[-0.02em]">
            {indicador.valor}
          </span>
          {indicador.detalle ? (
            <span className="text-[11.5px] text-muted-foreground">
              {indicador.detalle}
            </span>
          ) : null}
        </div>
      ))}
    </section>
  )
}

/** Placeholder de la fila mientras cargan los datos. */
export function FilaIndicadoresSkeleton() {
  return <Skeleton className="h-[104px] w-full rounded-xl" />
}
