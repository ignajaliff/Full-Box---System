import { Pencil } from "lucide-react"

import type { Cliente } from "@/features/clientes/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatDate } from "@/shared/utils/formatDate"

type TablaClientesProps = {
  clientes: Cliente[]
  onEditar: (cliente: Cliente) => void
}

const CLASE_TH = "h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground"

function iniciales(nombre: string) {
  const palabras = nombre.trim().split(/\s+/)
  return (
    palabras
      .slice(0, 2)
      .map((palabra) => palabra[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

export function TablaClientes({ clientes, onEditar }: TablaClientesProps) {
  return (
    <Table className="[&_td]:py-2.5">
      <TableHeader className="border-b border-border bg-table-head [&_th:not(:last-child)]:border-r [&_th]:border-border/60">
        <TableRow className="hover:bg-transparent">
          <TableHead className={CLASE_TH}>Cliente</TableHead>
          <TableHead className={CLASE_TH}>CUIT</TableHead>
          <TableHead className={`hidden md:table-cell ${CLASE_TH}`}>
            Condición IVA
          </TableHead>
          <TableHead className={CLASE_TH}>Teléfono</TableHead>
          <TableHead className={`hidden lg:table-cell ${CLASE_TH}`}>
            Alta
          </TableHead>
          <TableHead className="h-11 w-12">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow
            key={cliente.id}
            className="cursor-pointer border-hairline hover:bg-muted/40"
            onClick={() => onEditar(cliente)}
          >
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-muted text-[11px] font-bold text-muted-foreground"
                  aria-hidden="true"
                >
                  {iniciales(cliente.razon_social)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {cliente.razon_social}
                  </span>
                  {cliente.email ? (
                    <span className="truncate text-[11px] text-muted-foreground">
                      {cliente.email}
                    </span>
                  ) : null}
                </div>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap font-mono text-[12.5px] tabular-nums text-muted-foreground">
              {cliente.cuit ?? "—"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {cliente.condicion_iva ? (
                <Badge variant="muted" className="font-normal">
                  {cliente.condicion_iva}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="whitespace-nowrap font-mono text-[12.5px] tabular-nums text-muted-foreground">
              {cliente.telefono ?? "—"}
            </TableCell>
            <TableCell className="hidden font-mono text-[12.5px] tabular-nums text-muted-foreground lg:table-cell">
              {formatDate(cliente.created_at)}
            </TableCell>
            <TableCell className="py-1.5 text-right">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                aria-label={`Editar ${cliente.razon_social}`}
                onClick={(event) => {
                  // Evita disparar también el clic de la fila.
                  event.stopPropagation()
                  onEditar(cliente)
                }}
              >
                <Pencil aria-hidden="true" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
