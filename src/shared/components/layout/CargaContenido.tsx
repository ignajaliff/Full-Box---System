import { Skeleton } from "@/shared/components/ui/skeleton"

/**
 * Carga del área de contenido: imita el layout típico de una página
 * (título + tarjeta) mientras el sidebar queda visible y fijo.
 */
export function CargaContenido() {
  return (
    <div className="flex flex-col gap-[18px] p-6 pb-12 md:px-7">
      <div className="space-y-2 border-b border-hairline pb-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-[104px] w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
