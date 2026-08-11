import { ArrowRight, MoreHorizontal, XCircle } from "lucide-react"

import type { RemitoDetalle } from "@/features/remitos/hooks/useRemitos"
import {
  ESTADO_SIGUIENTE,
  ETIQUETA_ESTADO,
  VARIANTE_BADGE_ESTADO,
  esEstadoRemito,
  formatNumeroRemito,
} from "@/features/remitos/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatDate } from "@/shared/utils/formatDate"

type TablaRemitosProps = {
  remitos: RemitoDetalle[]
  onAvanzar: (remito: RemitoDetalle) => void
  onAnular: (remito: RemitoDetalle) => void
}

function BadgeEstado({ estado }: { estado: string }) {
  if (!esEstadoRemito(estado)) return <Badge variant="outline">{estado}</Badge>
  return (
    <Badge variant={VARIANTE_BADGE_ESTADO[estado]}>
      {ETIQUETA_ESTADO[estado]}
    </Badge>
  )
}

function BadgeCobro({ remito }: { remito: RemitoDetalle }) {
  if (remito.cobro_id) return <Badge variant="success">Cobrado</Badge>
  if (remito.estado === "entregado")
    return <Badge variant="outline">Pendiente</Badge>
  return <span className="text-muted-foreground">—</span>
}

export function TablaRemitos({ remitos, onAvanzar, onAnular }: TablaRemitosProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs uppercase tracking-wider">N°</TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Cliente
          </TableHead>
          <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">
            Productos
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Estado
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Cobro
          </TableHead>
          <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">
            Fecha
          </TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {remitos.map((remito) => {
          const estadoSiguiente = esEstadoRemito(remito.estado)
            ? ESTADO_SIGUIENTE[remito.estado]
            : undefined
          const puedeAnular =
            remito.estado !== "anulado" && remito.cobro_id === null
          const resumenItems = remito.items
            .map((item) => `${item.cantidad}× ${item.producto?.nombre ?? "?"}`)
            .join(", ")

          return (
            <TableRow key={remito.id}>
              <TableCell className="font-medium tabular-nums">
                {formatNumeroRemito(remito.numero)}
              </TableCell>
              <TableCell>{remito.cliente?.razon_social ?? "—"}</TableCell>
              <TableCell className="hidden max-w-72 md:table-cell">
                <p className="truncate text-muted-foreground" title={resumenItems}>
                  {resumenItems}
                </p>
              </TableCell>
              <TableCell>
                <BadgeEstado estado={remito.estado} />
              </TableCell>
              <TableCell>
                <BadgeCobro remito={remito} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {formatDate(remito.created_at)}
              </TableCell>
              <TableCell className="py-1.5 text-right">
                {estadoSiguiente || puedeAnular ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        aria-label={`Acciones del remito ${formatNumeroRemito(remito.numero)}`}
                      >
                        <MoreHorizontal aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {estadoSiguiente ? (
                        <DropdownMenuItem onSelect={() => onAvanzar(remito)}>
                          <ArrowRight aria-hidden="true" />
                          Pasar a «{ETIQUETA_ESTADO[estadoSiguiente]}»
                        </DropdownMenuItem>
                      ) : null}
                      {puedeAnular ? (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onAnular(remito)}
                        >
                          <XCircle aria-hidden="true" />
                          Anular remito
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
