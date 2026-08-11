import { Skeleton } from "@/shared/components/ui/skeleton"

/**
 * Carga del área de contenido: imita el layout típico de una página
 * (título + tarjeta) mientras el sidebar queda visible y fijo.
 */
export function CargaContenido() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
