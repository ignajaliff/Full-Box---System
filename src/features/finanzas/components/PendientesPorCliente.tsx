import { HandCoins } from "lucide-react"

import type { RemitoPendiente } from "@/features/finanzas/hooks/useFinanzas"
import { formatNumeroRemito } from "@/features/remitos/types"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { formatDate } from "@/shared/utils/formatDate"

export type GrupoPendiente = {
  clienteId: string
  razonSocial: string
  remitos: RemitoPendiente[]
}

type PendientesPorClienteProps = {
  grupos: GrupoPendiente[]
  seleccionados: Set<string>
  onToggle: (remitoId: string) => void
  onCobrar: (grupo: GrupoPendiente) => void
}

export function PendientesPorCliente({
  grupos,
  seleccionados,
  onToggle,
  onCobrar,
}: PendientesPorClienteProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {grupos.map((grupo) => {
        const cantidadSeleccionados = grupo.remitos.filter((remito) =>
          seleccionados.has(remito.id)
        ).length

        return (
          <Card key={grupo.clienteId} className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">{grupo.razonSocial}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {grupo.remitos.length} pendiente
                {grupo.remitos.length === 1 ? "" : "s"}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {grupo.remitos.map((remito) => (
                  <li key={remito.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={seleccionados.has(remito.id)}
                      onCheckedChange={() => onToggle(remito.id)}
                      aria-label={`Seleccionar ${formatNumeroRemito(remito.numero)}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium tabular-nums">
                        {formatNumeroRemito(remito.numero)}
                        <span className="ml-2 font-normal text-muted-foreground">
                          {formatDate(remito.created_at)}
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {remito.items
                          .map(
                            (item) =>
                              `${item.cantidad}× ${item.producto?.nombre ?? "?"}`
                          )
                          .join(", ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <Button
                size="sm"
                disabled={cantidadSeleccionados === 0}
                onClick={() => onCobrar(grupo)}
              >
                <HandCoins aria-hidden="true" />
                Cobrar seleccionados
                {cantidadSeleccionados > 0 ? ` (${cantidadSeleccionados})` : ""}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
