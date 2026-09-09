import { ArrowRight, MoreHorizontal, XCircle } from "lucide-react"

import type { RemitoDetalle } from "@/features/remitos/hooks/useRemitos"
import {
  ESTADO_SIGUIENTE,
  ETIQUETA_ESTADO,
  VARIANTE_BADGE_ESTADO,
  esEstadoRemito,
  formatNumeroRemito,
} from "@/features/remitos/types"
import { cn } from "@/lib/utils"
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
  onEditar: (remito: RemitoDetalle) => void
  onAnular: (remito: RemitoDetalle) => void
}

const CLASE_TH = "h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground"

function BadgeEstado({ estado }: { estado: string }) {
  if (!esEstadoRemito(estado)) return <Badge variant="muted">{estado}</Badge>
  return (
    <Badge variant={VARIANTE_BADGE_ESTADO[estado]}>
      {ETIQUETA_ESTADO[estado]}
    </Badge>
  )
}

function BadgeCobro({ remito }: { remito: RemitoDetalle }) {
  if (remito.cobro_id) return <Badge variant="success-soft">Cobrado</Badge>
  if (remito.estado === "entregado")
    return <Badge variant="muted">Pendiente</Badge>
  return <span className="text-muted-foreground">—</span>
}

export function TablaRemitos({
  remitos,
  onAvanzar,
  onEditar,
  onAnular,
}: TablaRemitosProps) {
  return (
    <Table className="[&_td]:py-2.5">
      <TableHeader className="border-b border-border bg-table-head [&_th:not(:last-child)]:border-r [&_th]:border-border/60">
        <TableRow className="hover:bg-transparent">
          <TableHead className={CLASE_TH}>N°</TableHead>
          <TableHead className={CLASE_TH}>Cliente</TableHead>
          <TableHead className={`hidden md:table-cell ${CLASE_TH}`}>
            Productos
          </TableHead>
          <TableHead className={CLASE_TH}>Estado</TableHead>
          <TableHead className={CLASE_TH}>Cobro</TableHead>
          <TableHead className={`hidden lg:table-cell ${CLASE_TH}`}>
            Fecha
          </TableHead>
          <TableHead className="h-11 w-px">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {remitos.map((remito) => {
          const estadoSiguiente = esEstadoRemito(remito.estado)
            ? ESTADO_SIGUIENTE[remito.estado]
            : undefined
          // Un remito cobrado o anulado ya no se toca (lo valida la base):
          // ni se edita al clickear la fila ni se puede anular.
          const editable =
            remito.estado !== "anulado" && remito.cobro_id === null
          const resumenItems = remito.items
            .map((item) => `${item.cantidad}× ${item.producto?.nombre ?? "?"}`)
            .join(", ")

          return (
            <TableRow
              key={remito.id}
              className={cn(
                "border-hairline hover:bg-muted/40",
                editable && "cursor-pointer"
              )}
              onClick={editable ? () => onEditar(remito) : undefined}
            >
              <TableCell className="whitespace-nowrap font-mono text-[12.5px] font-medium tabular-nums">
                {formatNumeroRemito(remito.numero)}
              </TableCell>
              <TableCell className="font-medium">
                {remito.cliente?.razon_social ?? "—"}
              </TableCell>
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
              <TableCell className="hidden font-mono text-[12.5px] tabular-nums text-muted-foreground lg:table-cell">
                {formatDate(remito.created_at)}
              </TableCell>
              {/* Los clics de acción no deben disparar la edición de la fila. */}
              <TableCell className="py-1.5">
                <div className="flex items-center justify-end gap-1.5">
                  {/* Avance de estado: acción principal, siempre a la vista. */}
                  {estadoSiguiente ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 whitespace-nowrap px-2.5 text-[12.5px]"
                      onClick={(evento) => {
                        evento.stopPropagation()
                        onAvanzar(remito)
                      }}
                    >
                      Pasar a {ETIQUETA_ESTADO[estadoSiguiente]}
                      <ArrowRight aria-hidden="true" />
                    </Button>
                  ) : null}

                  {editable ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground"
                          aria-label={`Más acciones del remito ${formatNumeroRemito(remito.numero)}`}
                          onClick={(evento) => evento.stopPropagation()}
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => onAnular(remito)}
                        >
                          <XCircle aria-hidden="true" />
                          Anular remito
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
