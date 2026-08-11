import type { CobroDetalle } from "@/features/finanzas/hooks/useFinanzas"
import { etiquetaMetodo, formatNumeroCobro } from "@/features/finanzas/types"
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

export function TablaCobros({ cobros }: TablaCobrosProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs uppercase tracking-wider">N°</TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Fecha
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Cliente
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Método
          </TableHead>
          <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">
            N° factura
          </TableHead>
          <TableHead className="text-right text-xs uppercase tracking-wider">
            Total
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cobros.map((cobro) => (
          <TableRow key={cobro.id}>
            <TableCell className="font-medium tabular-nums">
              {formatNumeroCobro(cobro.numero)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(cobro.fecha)}
            </TableCell>
            <TableCell>{cobro.cliente?.razon_social ?? "—"}</TableCell>
            <TableCell>
              <Badge variant="outline">{etiquetaMetodo(cobro.metodo)}</Badge>
            </TableCell>
            <TableCell className="hidden tabular-nums text-muted-foreground md:table-cell">
              {cobro.nro_factura ?? "—"}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatCurrency(cobro.total)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
