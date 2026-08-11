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

export function TablaClientes({ clientes, onEditar }: TablaClientesProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs uppercase tracking-wider">
            Cliente
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            CUIT
          </TableHead>
          <TableHead className="hidden text-xs uppercase tracking-wider md:table-cell">
            Condición IVA
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Teléfono
          </TableHead>
          <TableHead className="hidden text-xs uppercase tracking-wider lg:table-cell">
            Alta
          </TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow
            key={cliente.id}
            className="cursor-pointer"
            onClick={() => onEditar(cliente)}
          >
            <TableCell>
              <p className="font-medium">{cliente.razon_social}</p>
              {cliente.email ? (
                <p className="text-xs text-muted-foreground">{cliente.email}</p>
              ) : null}
            </TableCell>
            <TableCell className="tabular-nums text-muted-foreground">
              {cliente.cuit ?? "—"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {cliente.condicion_iva ? (
                <Badge variant="outline">{cliente.condicion_iva}</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {cliente.telefono ?? "—"}
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
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
