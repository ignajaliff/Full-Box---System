import type { Control } from "react-hook-form"

import type { RemitoPendiente } from "@/features/finanzas/hooks/useFinanzas"
import type { CobroInput } from "@/features/finanzas/schema"
import { formatNumeroRemito } from "@/features/remitos/types"
import { Card } from "@/shared/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { formatCurrency } from "@/shared/utils/formatCurrency"
import { formatDate } from "@/shared/utils/formatDate"

type TarjetaRemitoCobroProps = {
  remito: RemitoPendiente
  control: Control<CobroInput>
  /** Precios en vivo del formulario, en el orden de `itemsPlanos`. */
  precios: CobroInput["precios"]
  /** Posición de un item dentro de `precios` (los índices son globales). */
  indiceDe: (itemId: string) => number
}

/**
 * Un remito dentro de la vista de cobro: encabezado con su número, fecha y
 * subtotal en vivo, y la lista de items con el precio unitario editable.
 */
export function TarjetaRemitoCobro({
  remito,
  control,
  precios,
  indiceDe,
}: TarjetaRemitoCobroProps) {
  const subtotal = remito.items.reduce((suma, item) => {
    const precio = precios[indiceDe(item.id)]?.precio
    return precio ? suma + item.cantidad * precio : suma
  }, 0)

  return (
    <Card className="overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[13px] font-semibold tabular-nums">
            {formatNumeroRemito(remito.numero)}
          </span>
          <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
            {formatDate(remito.created_at)}
          </span>
        </div>
        <span className="font-mono text-[13px] font-semibold tabular-nums">
          {formatCurrency(subtotal)}
        </span>
      </div>

      <ul className="divide-y divide-hairline">
        {remito.items.map((item) => {
          const indice = indiceDe(item.id)
          const precio = precios[indice]?.precio
          const subtotalItem =
            precio !== null && precio !== undefined
              ? item.cantidad * precio
              : null

          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 px-5 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {item.producto?.nombre ?? "Producto"}
                </p>
                {item.producto?.medida ? (
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {item.producto.medida}
                  </p>
                ) : null}
              </div>

              <span className="shrink-0 font-mono text-[12.5px] tabular-nums text-muted-foreground">
                {item.cantidad} ×
              </span>

              <FormField
                control={control}
                name={`precios.${indice}.precio`}
                render={({ field }) => (
                  <FormItem className="w-32 shrink-0">
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        aria-label={`Precio unitario de ${item.producto?.nombre ?? "producto"}`}
                        className="h-9 font-mono tabular-nums"
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const valor = event.target.valueAsNumber
                          field.onChange(Number.isNaN(valor) ? null : valor)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <span className="w-28 shrink-0 text-right font-mono text-[12.5px] font-medium tabular-nums">
                {subtotalItem !== null ? formatCurrency(subtotalItem) : "—"}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
