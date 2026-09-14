import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { useVersionNueva } from "@/shared/hooks/useVersionNueva"

/** «Más tarde» esconde el aviso este tiempo y después vuelve a aparecer. */
const POSPONER_MS = 30 * 60 * 1000

/**
 * Aviso flotante de versión nueva. Una SPA abierta nunca vuelve a pedir el
 * index.html, así que sin esto el usuario sigue en el bundle viejo hasta que
 * recarga por su cuenta. «Actualizar» recarga la página (el servidor sirve el
 * index.html con no-store, así que trae la versión nueva).
 *
 * Se puede posponer porque recargar pierde lo que haya sin guardar en un
 * formulario abierto.
 */
export function AvisoVersionNueva() {
  const hayNueva = useVersionNueva()
  const [pospuesto, setPospuesto] = useState(false)

  useEffect(() => {
    if (!pospuesto) return
    const temporizador = window.setTimeout(
      () => setPospuesto(false),
      POSPONER_MS
    )
    return () => window.clearTimeout(temporizador)
  }, [pospuesto])

  if (!hayNueva || pospuesto) return null

  return (
    <div
      role="status"
      aria-live="polite"
      // Por encima de los paneles y diálogos (z-50) para que siempre se
      // pueda accionar.
      className="fixed bottom-4 left-4 right-4 z-[60] sm:left-auto sm:w-[360px]"
    >
      <div className="flex gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-lg">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            Hay una versión nueva del sistema
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Actualizá para ver los últimos cambios. Si estás cargando algo,
            guardalo antes.
          </p>

          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => window.location.reload()}>
              Actualizar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPospuesto(true)}>
              Más tarde
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
