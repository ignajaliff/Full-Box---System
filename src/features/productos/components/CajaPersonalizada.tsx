import { useMemo, useState } from "react"
import { Ruler } from "lucide-react"

import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { formatCurrency } from "@/shared/utils/formatCurrency"

/**
 * Cotizador de cajas a medida: el precio sale de un valor por centímetro
 * para cada dimensión (precio = largo × $/cm + ancho × $/cm + alto × $/cm).
 *
 * TODO(supabase): estos tres valores son el punto de partida y hoy se editan
 * a mano en la página. Cuando exista la tabla de parámetros de la fábrica,
 * cargarlos desde ahí y guardar los cambios.
 */
const VALORES_INICIALES = {
  largo: "120",
  ancho: "120",
  alto: "90",
} as const

type Dimension = "largo" | "ancho" | "alto"

const DIMENSIONES: { clave: Dimension; etiqueta: string }[] = [
  { clave: "largo", etiqueta: "Largo" },
  { clave: "ancho", etiqueta: "Ancho" },
  { clave: "alto", etiqueta: "Alto" },
]

type Campos = Record<Dimension, string>

const MEDIDAS_VACIAS: Campos = { largo: "", ancho: "", alto: "" }

/** Número positivo o null (campo vacío o inválido). */
function aNumero(valor: string) {
  const numero = Number(valor.replace(",", "."))
  return Number.isFinite(numero) && numero > 0 ? numero : null
}

function formatNumero(valor: number) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1)
}

export function CajaPersonalizada() {
  const [medidas, setMedidas] = useState<Campos>(MEDIDAS_VACIAS)
  const [valoresPorCm, setValoresPorCm] = useState<Campos>(VALORES_INICIALES)

  const cotizacion = useMemo(() => {
    // Cada dimensión aporta: centímetros × su valor por cm.
    const partes = DIMENSIONES.map(({ clave, etiqueta }) => {
      const cm = aNumero(medidas[clave])
      const valorCm = aNumero(valoresPorCm[clave])
      return {
        clave,
        etiqueta,
        cm,
        subtotal: cm !== null && valorCm !== null ? cm * valorCm : null,
      }
    })

    if (partes.some((parte) => parte.subtotal === null)) return null

    return {
      partes,
      medida: `${partes.map((parte) => formatNumero(parte.cm ?? 0)).join(" × ")} cm`,
      total: partes.reduce((suma, parte) => suma + (parte.subtotal ?? 0), 0),
    }
  }, [medidas, valoresPorCm])

  return (
    <Card className="rounded-xl">
      <div className="flex items-center gap-2.5 border-b border-hairline px-5 py-3.5">
        <Ruler
          className="h-4 w-4 text-primary"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
            Caja personalizada
          </h2>
          <p className="text-[12.5px] text-muted-foreground">
            Definí el valor por centímetro de cada lado y cargá las medidas.
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[auto_1fr] lg:gap-8">
        {/* Medidas de la caja + valor por cm de cada dimensión */}
        <div className="flex flex-wrap gap-4">
          {DIMENSIONES.map(({ clave, etiqueta }) => (
            <div key={clave} className="w-[120px] space-y-1.5">
              <Label htmlFor={`caja-${clave}`} className="text-[12.5px]">
                {etiqueta}
              </Label>
              <div className="relative">
                <Input
                  id={`caja-${clave}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={medidas[clave]}
                  onChange={(evento) =>
                    setMedidas((previas) => ({
                      ...previas,
                      [clave]: evento.target.value,
                    }))
                  }
                  className="h-9 pr-9 font-mono text-[13px] tabular-nums"
                />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11.5px] text-muted-foreground"
                  aria-hidden="true"
                >
                  cm
                </span>
              </div>

              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11.5px] text-muted-foreground"
                  aria-hidden="true"
                >
                  $
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  placeholder="0"
                  aria-label={`Valor por centímetro de ${etiqueta.toLocaleLowerCase("es")}`}
                  value={valoresPorCm[clave]}
                  onChange={(evento) =>
                    setValoresPorCm((previos) => ({
                      ...previos,
                      [clave]: evento.target.value,
                    }))
                  }
                  className="h-8 pl-6 pr-10 font-mono text-[12.5px] tabular-nums"
                />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground"
                  aria-hidden="true"
                >
                  /cm
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Resultado */}
        <div className="flex flex-col justify-center gap-1.5 border-t border-hairline pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <span className="text-[12.5px] font-medium">Precio calculado</span>

          {cotizacion ? (
            <>
              <span className="font-mono text-[26px] font-semibold tabular-nums tracking-[-0.02em]">
                {formatCurrency(cotizacion.total)}
              </span>
              <p className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                {cotizacion.medida} ·{" "}
                {cotizacion.partes
                  .map(
                    (parte) =>
                      `${parte.etiqueta.toLocaleLowerCase("es")} ${formatCurrency(parte.subtotal ?? 0)}`
                  )
                  .join(" + ")}
              </p>
            </>
          ) : (
            <p className="text-[12.5px] text-muted-foreground">
              Completá las tres medidas y sus valores por centímetro para ver el
              precio.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
