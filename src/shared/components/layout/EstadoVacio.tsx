import type { LucideIcon } from "lucide-react"

type EstadoVacioProps = {
  icono: LucideIcon
  titulo: string
  descripcion: string
}

/** Estado vacío de una tarjeta de listado (sin datos o sin resultados). */
export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
}: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <Icono
        className="h-8 w-8 text-muted-foreground"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <p className="text-sm font-medium">{titulo}</p>
      <p className="text-sm text-muted-foreground">{descripcion}</p>
    </div>
  )
}
