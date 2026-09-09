import { HandCoins } from "lucide-react"

import type { GrupoPendiente } from "@/features/finanzas/hooks/useResumenFinanzas"
import { formatNumeroRemito } from "@/features/remitos/types"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { formatCurrency } from "@/shared/utils/formatCurrency"
import { formatDate } from "@/shared/utils/formatDate"

export type { GrupoPendiente }

type PendientesPorClienteProps = {
  grupos: GrupoPendiente[]
  seleccionados: Set<string>
  onToggle: (remitoId: string) => void
  /** Marca o desmarca todos los remitos de un cliente de una vez. */
  onToggleGrupo: (grupo: GrupoPendiente, marcar: boolean) => void
  onCobrar: (grupo: GrupoPendiente) => void
}

/** Valor estimado del remito con los precios de catálogo vigentes. */
function estimarRemito(remito: GrupoPendiente["remitos"][number]) {
  return remito.items.reduce(
    (suma, item) => suma + item.cantidad * (item.producto?.precio ?? 0),
    0
  )
}

/**
 * Pendientes agrupados por cliente, a ancho completo (una tarjeta por cliente,
 * no dos columnas): los remitos tienen varios items y en media tarjeta el
 * detalle quedaba truncado.
 *
 * Cada grupo permite marcar todo el cliente de una vez y muestra el total
 * ESTIMADO con precios de catálogo — el definitivo se fija al cobrar.
 */
export function PendientesPorCliente({
  grupos,
  seleccionados,
  onToggle,
  onToggleGrupo,
  onCobrar,
}: PendientesPorClienteProps) {
  return (
    <div className="flex flex-col gap-4">
      {grupos.map((grupo) => {
        const elegidos = grupo.remitos.filter((remito) =>
          seleccionados.has(remito.id)
        )
        const todosMarcados = elegidos.length === grupo.remitos.length
        const totalEstimado = elegidos.reduce(
          (suma, remito) => suma + estimarRemito(remito),
          0
        )

        return (
          <Card key={grupo.clienteId} className="overflow-hidden rounded-xl">
            <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-5 py-3">
              <Checkbox
                checked={todosMarcados}
                onCheckedChange={() => onToggleGrupo(grupo, !todosMarcados)}
                aria-label={`Seleccionar todos los remitos de ${grupo.razonSocial}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">
                  {grupo.razonSocial}
                </p>
                <p className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                  {grupo.remitos.length} remito
                  {grupo.remitos.length === 1 ? "" : "s"} pendiente
                  {grupo.remitos.length === 1 ? "" : "s"}
                </p>
              </div>

              <Button
                size="sm"
                disabled={elegidos.length === 0}
                onClick={() => onCobrar(grupo)}
              >
                <HandCoins aria-hidden="true" />
                Cobrar
                {elegidos.length > 0 ? ` ${elegidos.length}` : ""}
              </Button>
            </div>

            <ul className="divide-y divide-hairline">
              {grupo.remitos.map((remito) => {
                const marcado = seleccionados.has(remito.id)

                return (
                  <li key={remito.id}>
                    {/* Toda la fila alterna la selección: el checkbox solo es
                        el indicador visual. */}
                    <button
                      type="button"
                      onClick={() => onToggle(remito.id)}
                      aria-pressed={marcado}
                      className={cn(
                        "flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40",
                        marcado && "bg-muted/30"
                      )}
                    >
                      <Checkbox
                        checked={marcado}
                        // El click lo maneja la fila; el checkbox no
                        // intercepta para no disparar dos veces.
                        tabIndex={-1}
                        className="pointer-events-none mt-0.5"
                        aria-hidden="true"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2.5">
                          <span className="font-mono text-[12.5px] font-medium tabular-nums">
                            {formatNumeroRemito(remito.numero)}
                          </span>
                          <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                            {formatDate(remito.created_at)}
                          </span>
                        </div>

                        {/* Los items completos, uno por línea: en la vista
                            anterior se truncaban en una sola. */}
                        <ul className="mt-1 space-y-0.5">
                          {remito.items.map((item) => (
                            <li
                              key={item.id}
                              className="flex gap-2 text-[12.5px] text-muted-foreground"
                            >
                              <span className="shrink-0 font-mono tabular-nums">
                                {item.cantidad}×
                              </span>
                              <span className="min-w-0 truncate">
                                {item.producto?.nombre ?? "Producto"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <span className="shrink-0 text-right">
                        <span className="block font-mono text-[12.5px] font-medium tabular-nums">
                          {formatCurrency(estimarRemito(remito))}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          estimado
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {elegidos.length > 0 ? (
              <div className="flex items-center justify-between border-t border-hairline bg-muted/20 px-5 py-2.5">
                <span className="text-[12.5px] text-muted-foreground">
                  {elegidos.length} seleccionado
                  {elegidos.length === 1 ? "" : "s"}
                </span>
                <span className="font-mono text-[13px] font-semibold tabular-nums">
                  {formatCurrency(totalEstimado)}
                </span>
              </div>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
