import { Component, type ErrorInfo, type ReactNode } from "react"

type ErrorBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

const CLAVE_RECARGA = "fullbox:recarga-por-chunk"
/** Como mucho una recarga automática por minuto: evita un bucle si el error persiste. */
const MINIMO_ENTRE_RECARGAS_MS = 60 * 1000

/**
 * Un chunk lazy que ya no existe en el servidor: pasa justo después de un
 * deploy, porque los nombres de los archivos llevan hash y los viejos se van.
 * Mensajes de Chrome, Firefox y Safari respectivamente.
 */
function esErrorDeChunk(error: Error) {
  return /dynamically imported module|Importing a module script failed|Loading chunk/i.test(
    error.message
  )
}

/** Recarga si no se recargó por lo mismo hace menos de un minuto. */
function recargarSiCorresponde() {
  try {
    const ultima = Number(sessionStorage.getItem(CLAVE_RECARGA) ?? 0)
    if (Date.now() - ultima < MINIMO_ENTRE_RECARGAS_MS) return
    sessionStorage.setItem(CLAVE_RECARGA, String(Date.now()))
  } catch {
    // Sin sessionStorage (modo privado estricto): igual conviene recargar una vez.
  }
  window.location.reload()
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info)

    // Tras un deploy, la versión vieja pide un archivo que ya no está: en vez
    // de la pantalla de error, se recarga para tomar la versión nueva.
    if (esErrorDeChunk(error)) recargarSiCorresponde()
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
