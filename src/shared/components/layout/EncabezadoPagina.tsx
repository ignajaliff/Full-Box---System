import type { ReactNode } from "react"

type EncabezadoPaginaProps = {
  titulo: string
  descripcion?: ReactNode
  /** Acciones de la página (ej. «Nuevo cliente»), alineadas a la derecha. */
  acciones?: ReactNode
}

/**
 * Encabezado del estilo CRM: título + bajada, cerrado con una hairline.
 * Todas las páginas del sistema lo usan para que el arranque sea idéntico.
 */
export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
}: EncabezadoPaginaProps) {
  // h-16 y contenido centrado: la barra iguala en alto al bloque del logo del
  // sidebar, así ambas líneas inferiores forman una sola horizontal.
  return (
    <header className="flex h-16 items-center justify-between gap-4">
      <div className="space-y-0.5">
        <h1 className="text-[17px] font-bold tracking-[-0.01em]">{titulo}</h1>
        {descripcion ? (
          <p className="text-[12.5px] text-muted-foreground">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? <div className="flex gap-2">{acciones}</div> : null}
    </header>
  )
}
