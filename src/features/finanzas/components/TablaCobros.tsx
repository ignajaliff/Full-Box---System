import { Fragment, useState } from "react"
import { ChevronRight } from "lucide-react"

import type { CobroDetalle } from "@/features/finanzas/hooks/useFinanzas"
import { etiquetaMetodo, formatNumeroCobro } from "@/features/finanzas/types"
import { formatNumeroRemito } from "@/features/remitos/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatCurrency } from "@/shared/utils/formatCurrency"
import { formatDate } from "@/shared/utils/formatDate"

type TablaCobrosProps = {
  cobros: CobroDetalle[]
}

const CLASE_TH = "h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground"

/** Desglose de los remitos incluidos en un cobro, con sus items valorizados. */
function DesgloseCobro({ cobro }: { cobro: CobroDetalle }) {
  if (cobro.remitos.length === 0) {
    return (
      <p className="px-4 py-3 text-[12.5px] text-muted-foreground">
        Este cobro no tiene remitos asociados.
      </p>
    )
  }

  return (
    <div className="space-y-3 px-4 py-3.5">
      {cobro.remitos.map((remito) => {
        const subtotal = remito.items.reduce(
          (suma, item) => suma + item.cantidad * (item.precio_unitario ?? 0),
          0
        )

        return (
          <div
            key={remito.id}
            className="overflow-hidden rounded-lg border border-hairline bg-background"
          >
            <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
              <span className="font-mono text-[12px] font-semibold tabular-nums">
                {formatNumeroRemito(remito.numero)}
              </span>
              <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <ul className="divide-y divide-hairline">
              {remito.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-1.5 text-[12.5px]"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {item.producto?.nombre ?? "Producto"}
                    {item.producto?.medida ? (
                      <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                        {item.producto.medida}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
                    {item.cantidad} ×{" "}
                    {item.precio_unitario !== null
                      ? formatCurrency(item.precio_unitario)
                      : "—"}
                  </span>
                  <span className="w-24 shrink-0 text-right font-mono tabular-nums">
                    {formatCurrency(item.cantidad * (item.precio_unitario ?? 0))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {cobro.notas ? (
        <p className="text-[12.5px] text-muted-foreground">
          <span className="font-medium">Notas:</span> {cobro.notas}
        </p>
      ) : null}
    </div>
  )
}

export function TablaCobros({ cobros }: TablaCobrosProps) {
  // Un solo cobro desplegado a la vez: el desglose puede ser largo.
  const [abierto, setAbierto] = useState<string | null>(null)

  return (
    <Table className="[&_td]:py-2.5">
      <TableHeader className="border-b border-border bg-table-head [&_th:not(:last-child)]:border-r [&_th]:border-border/60">
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn("w-8", CLASE_TH)}>
            <span className="sr-only">Desglose</span>
          </TableHead>
          <TableHead className={CLASE_TH}>N°</TableHead>
          <TableHead className={CLASE_TH}>Fecha</TableHead>
          <TableHead className={CLASE_TH}>Cliente</TableHead>
          <TableHead className={CLASE_TH}>Método</TableHead>
          <TableHead className={`hidden md:table-cell ${CLASE_TH}`}>
            N° factura
          </TableHead>
          <TableHead className={`text-right ${CLASE_TH}`}>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cobros.map((cobro) => {
          const desplegado = abierto === cobro.id

          return (
            <Fragment key={cobro.id}>
              <TableRow
                className="cursor-pointer border-hairline hover:bg-muted/40"
                onClick={() => setAbierto(desplegado ? null : cobro.id)}
                aria-expanded={desplegado}
              >
                <TableCell className="pr-0">
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      desplegado && "rotate-90"
                    )}
                    aria-hidden="true"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-[12.5px] font-medium tabular-nums">
                  {formatNumeroCobro(cobro.numero)}
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-[12.5px] tabular-nums text-muted-foreground">
                  {formatDate(cobro.fecha)}
                </TableCell>
                <TableCell className="font-medium">
                  {cobro.cliente?.razon_social ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="muted" className="font-normal">
                    {etiquetaMetodo(cobro.metodo)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden font-mono text-[12.5px] tabular-nums text-muted-foreground md:table-cell">
                  {cobro.nro_factura ?? "—"}
                </TableCell>
                <TableCell className="text-right font-mono text-[12.5px] font-medium tabular-nums">
                  {formatCurrency(cobro.total)}
                </TableCell>
              </TableRow>

              {desplegado ? (
                <TableRow className="border-hairline hover:bg-transparent">
                  <TableCell colSpan={7} className="bg-muted/30 !p-0">
                    <DesgloseCobro cobro={cobro} />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}
