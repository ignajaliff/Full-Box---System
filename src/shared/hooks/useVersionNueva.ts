import { useEffect, useRef, useState } from "react"

const INTERVALO_MS = 5 * 60 * 1000
/** Al volver a la pestaña no se consulta más de una vez por minuto. */
const MINIMO_ENTRE_CHEQUEOS_MS = 60 * 1000

/**
 * Detecta si hay una versión nueva desplegada. Compara el id del build que
 * está corriendo (`__BUILD_ID__`, incrustado al compilar) con el que sirve el
 * servidor en `version.json` (emitido por el mismo build, ver vite.config.ts).
 *
 * Chequea al arrancar (cubre el caso de un index.html viejo cacheado), cada
 * 5 minutos y cada vez que la pestaña vuelve a estar visible — el momento
 * típico en que alguien retoma una sesión abierta hace horas. En desarrollo
 * no hace nada: no existe version.json.
 */
export function useVersionNueva() {
  const [hayNueva, setHayNueva] = useState(false)
  const ultimoChequeo = useRef(0)

  useEffect(() => {
    if (import.meta.env.DEV) return

    let cancelado = false

    async function verificar(forzar: boolean) {
      const ahora = Date.now()
      if (!forzar && ahora - ultimoChequeo.current < MINIMO_ENTRE_CHEQUEOS_MS) {
        return
      }
      ultimoChequeo.current = ahora

      try {
        // El parámetro y `no-store` evitan cualquier caché intermedia.
        const respuesta = await fetch(
          `${import.meta.env.BASE_URL}version.json?_=${ahora}`,
          { cache: "no-store" }
        )
        if (!respuesta.ok) return

        const datos: unknown = await respuesta.json()
        const build =
          typeof datos === "object" && datos !== null && "build" in datos
            ? (datos as { build: unknown }).build
            : null

        if (!cancelado && typeof build === "string" && build !== __BUILD_ID__) {
          setHayNueva(true)
        }
      } catch {
        // Sin red o servidor caído: se reintenta en el próximo ciclo.
      }
    }

    void verificar(true)
    const intervalo = window.setInterval(() => void verificar(true), INTERVALO_MS)

    const alVolver = () => {
      if (document.visibilityState === "visible") void verificar(false)
    }
    document.addEventListener("visibilitychange", alVolver)
    window.addEventListener("focus", alVolver)

    return () => {
      cancelado = true
      window.clearInterval(intervalo)
      document.removeEventListener("visibilitychange", alVolver)
      window.removeEventListener("focus", alVolver)
    }
  }, [])

  return hayNueva
}
