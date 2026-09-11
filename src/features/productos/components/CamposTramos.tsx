import { Plus, X } from "lucide-react"
import { useFieldArray, useWatch, type Control } from "react-hook-form"

import { CampoNumerico } from "@/features/productos/components/CampoNumerico"
import type { ProductoInput } from "@/features/productos/schema"
import { MAX_TRAMOS, type TramoPrecio } from "@/features/productos/types"
import { Button } from "@/shared/components/ui/button"
import { formatCurrency } from "@/shared/utils/formatCurrency"

type CamposTramosProps = {
  control: Control<ProductoInput>
}

// Fila nueva sin valores: los inputs arrancan vacíos y el schema exige
// completarlos. El tipo del formulario no admite null, de ahí el cast.
const FILA_VACIA = { cantidad: null, precio: null } as unknown as TramoPrecio

function esNumero(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor)
}

/**
 * Tramos de precio por cantidad: hasta MAX_TRAMOS filas «desde N unidades,
 * precio unitario X». Reemplazan a los tres descuentos fijos (100/250/500),
 * que no servían para casos como «mínimo 20 y un solo tramo en 60».
 */
export function CamposTramos({ control }: CamposTramosProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "tramos" })
  // Valores en vivo para la vista previa «100+ u. → $1.400 c/u».
  const tramos = useWatch({ control, name: "tramos" })

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Precios por cantidad</p>
          <p className="text-[12px] text-muted-foreground">
            Desde cada cantidad aplica ese precio unitario. Cada tramo tiene
            que superar la unidad mínima.
          </p>
        </div>
        {fields.length < MAX_TRAMOS ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => append(FILA_VACIA)}
          >
            <Plus aria-hidden="true" />
            Agregar tramo
          </Button>
        ) : null}
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-center text-[12.5px] text-muted-foreground">
          Sin tramos: el precio base vale para cualquier cantidad.
        </p>
      ) : (
        <ul className="space-y-2">
          {fields.map((campo, indice) => {
            const fila = tramos?.[indice]

            return (
              <li
                key={campo.id}
                className="space-y-3 rounded-lg border border-hairline bg-muted/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                    Tramo {indice + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {fila && esNumero(fila.cantidad) && esNumero(fila.precio) ? (
                      <span className="font-mono text-[12.5px] tabular-nums">
                        {fila.cantidad}+ u. → {formatCurrency(fila.precio)} c/u
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => remove(indice)}
                      aria-label={`Quitar tramo ${indice + 1}`}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <CampoNumerico
                    control={control}
                    name={`tramos.${indice}.cantidad`}
                    etiqueta="Desde (unidades)"
                    step="1"
                  />
                  <CampoNumerico
                    control={control}
                    name={`tramos.${indice}.precio`}
                    etiqueta="Precio unitario ($)"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
