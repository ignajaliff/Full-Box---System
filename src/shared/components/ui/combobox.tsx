import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"

export type OpcionCombobox = {
  valor: string
  etiqueta: string
  /** Texto secundario a la derecha de la opción (ej. medida o CUIT), en mono. */
  detalle?: string
}

type ComboboxProps = {
  opciones: OpcionCombobox[]
  valor: string
  onSeleccionar: (valor: string) => void
  placeholder: string
  placeholderBusqueda: string
  /** Mensaje cuando la búsqueda no encuentra nada. */
  sinResultados?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type">

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").trim()
}

/**
 * Select con buscador, hecho con primitivas propias (sin dependencias nuevas).
 * Pensado para listas largas donde el select nativo se queda corto
 * (clientes, productos). Para listas cortas y fijas sigue `NativeSelect`.
 */
export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      opciones,
      valor,
      onSeleccionar,
      placeholder,
      placeholderBusqueda,
      sinResultados = "Sin resultados para esa búsqueda.",
      className,
      ...props
    },
    ref
  ) => {
    const raiz = React.useRef<HTMLDivElement>(null)
    const inputBusqueda = React.useRef<HTMLInputElement>(null)
    const [abierto, setAbierto] = React.useState(false)
    const [busqueda, setBusqueda] = React.useState("")
    const [activa, setActiva] = React.useState(0)

    const seleccionada = opciones.find((opcion) => opcion.valor === valor)

    const filtradas = React.useMemo(() => {
      const termino = normalizar(busqueda)
      if (!termino) return opciones
      return opciones.filter((opcion) =>
        normalizar(`${opcion.etiqueta} ${opcion.detalle ?? ""}`).includes(
          termino
        )
      )
    }, [opciones, busqueda])

    // Cierra al clickear fuera del componente.
    React.useEffect(() => {
      if (!abierto) return
      function alClickearFuera(evento: PointerEvent) {
        if (!raiz.current?.contains(evento.target as Node)) setAbierto(false)
      }
      document.addEventListener("pointerdown", alClickearFuera)
      return () => document.removeEventListener("pointerdown", alClickearFuera)
    }, [abierto])

    // Al abrir: búsqueda limpia, primera opción activa y foco en el buscador.
    React.useEffect(() => {
      if (abierto) {
        setBusqueda("")
        setActiva(0)
        inputBusqueda.current?.focus()
      }
    }, [abierto])

    function seleccionar(nuevoValor: string) {
      onSeleccionar(nuevoValor)
      setAbierto(false)
    }

    function manejarTeclado(evento: React.KeyboardEvent<HTMLInputElement>) {
      if (evento.key === "ArrowDown") {
        evento.preventDefault()
        setActiva((previa) => Math.min(previa + 1, filtradas.length - 1))
      } else if (evento.key === "ArrowUp") {
        evento.preventDefault()
        setActiva((previa) => Math.max(previa - 1, 0))
      } else if (evento.key === "Enter") {
        // No dispara el submit del formulario que lo contiene.
        evento.preventDefault()
        const opcion = filtradas[activa]
        if (opcion) seleccionar(opcion.valor)
      } else if (evento.key === "Escape") {
        // Cierra el combobox sin cerrar el diálogo que lo contiene.
        evento.stopPropagation()
        setAbierto(false)
      }
    }

    return (
      <div ref={raiz} className="relative">
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={abierto}
          aria-haspopup="listbox"
          onClick={() => setAbierto((previo) => !previo)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          <span className={cn("truncate", !seleccionada && "text-muted-foreground")}>
            {seleccionada?.etiqueta ?? placeholder}
          </span>
          <ChevronsUpDown
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </button>

        {abierto ? (
          <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
            <div className="flex items-center gap-2 border-b border-hairline px-3">
              <Search
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputBusqueda}
                type="text"
                value={busqueda}
                onChange={(evento) => {
                  setBusqueda(evento.target.value)
                  setActiva(0)
                }}
                onKeyDown={manejarTeclado}
                placeholder={placeholderBusqueda}
                aria-label={placeholderBusqueda}
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {filtradas.length > 0 ? (
              <ul role="listbox" className="max-h-56 overflow-y-auto p-1">
                {filtradas.map((opcion, indice) => (
                  <li key={opcion.valor} role="option" aria-selected={opcion.valor === valor}>
                    <button
                      type="button"
                      onClick={() => seleccionar(opcion.valor)}
                      onPointerEnter={() => setActiva(indice)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm",
                        indice === activa && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 text-primary",
                          opcion.valor !== valor && "invisible"
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{opcion.etiqueta}</span>
                      {opcion.detalle ? (
                        <span className="ml-auto shrink-0 font-mono text-[11.5px] tabular-nums text-muted-foreground">
                          {opcion.detalle}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {sinResultados}
              </p>
            )}
          </div>
        ) : null}
      </div>
    )
  }
)
Combobox.displayName = "Combobox"
