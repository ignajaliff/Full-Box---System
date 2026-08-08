import { Pencil, Star } from "lucide-react"

import type { Producto } from "@/features/productos/types"
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
import { formatCurrency } from "@/shared/utils/formatCurrency"
import { formatDate } from "@/shared/utils/formatDate"

type TablaProductosProps = {
  productos: Producto[]
  onEditar: (producto: Producto) => void
}

export function TablaProductos({ productos, onEditar }: TablaProductosProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs uppercase tracking-wider">
            Producto
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Medida
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Precio desde
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wider">
            Web
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
        {productos.map((producto) => (
          <TableRow
            key={producto.id}
            className="cursor-pointer"
            onClick={() => onEditar(producto)}
          >
            <TableCell>
              <div className="flex items-center gap-1.5 font-medium">
                {producto.nombre}
                {producto.destacado ? (
                  <Star
                    className="h-3.5 w-3.5 fill-primary text-primary"
                    aria-label="Destacado en la home"
                  />
                ) : null}
              </div>
              {producto.categoria ? (
                <p className="text-xs text-muted-foreground">
                  {producto.categoria}
                </p>
              ) : null}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {producto.medida}
            </TableCell>
            <TableCell className="tabular-nums">
              {producto.precio !== null ? (
                formatCurrency(producto.precio)
              ) : (
                <span className="text-muted-foreground">Consultar</span>
              )}
            </TableCell>
            <TableCell>
              {producto.activo ? (
                <Badge variant="success">Visible</Badge>
              ) : (
                <Badge variant="outline">Oculto</Badge>
              )}
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              {formatDate(producto.created_at)}
            </TableCell>
            <TableCell className="py-1.5 text-right">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                aria-label={`Editar ${producto.nombre}`}
                onClick={(event) => {
                  // Evita disparar también el clic de la fila.
                  event.stopPropagation()
                  onEditar(producto)
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
