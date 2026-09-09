import { Pencil, Star } from "lucide-react"

import { useAlternarVisibilidad } from "@/features/productos/hooks/useProductos"
import type { Producto } from "@/features/productos/types"
import { cn } from "@/lib/utils"
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

function iniciales(nombre: string) {
  const palabras = nombre.trim().split(/\s+/)
  return (
    palabras
      .slice(0, 2)
      .map((palabra) => palabra[0]?.toUpperCase() ?? "")
      .join("") || "?"
  )
}

export function TablaProductos({ productos, onEditar }: TablaProductosProps) {
  const alternar = useAlternarVisibilidad()

  return (
    <Table className="[&_td]:py-2.5">
      <TableHeader className="border-b border-border bg-table-head [&_th:not(:last-child)]:border-r [&_th]:border-border/60">
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground">
            Producto
          </TableHead>
          <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground">
            Medida
          </TableHead>
          <TableHead className="hidden h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground md:table-cell">
            Categoría
          </TableHead>
          <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground">
            Precio desde
          </TableHead>
          <TableHead className="h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground">
            Web
          </TableHead>
          <TableHead className="hidden h-11 text-[11px] font-bold uppercase tracking-[0.05em] text-table-head-foreground lg:table-cell">
            Alta
          </TableHead>
          <TableHead className="h-11 w-12">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productos.map((producto) => (
          <TableRow
            key={producto.id}
            className="cursor-pointer border-hairline hover:bg-muted/40"
            onClick={() => onEditar(producto)}
          >
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] text-[11px] font-bold",
                    producto.activo
                      ? "bg-muted text-foreground/70"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  {iniciales(producto.nombre)}
                </div>
                <span className="truncate font-medium">
                  {producto.nombre}
                  {producto.destacado ? (
                    <Star
                      className="ml-1.5 inline h-3.5 w-3.5 fill-primary text-primary"
                      aria-label="Destacado en la home"
                    />
                  ) : null}
                </span>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap font-mono text-[12.5px] tabular-nums text-muted-foreground">
              {producto.medida}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {producto.categoria ? (
                <Badge variant="muted" className="font-normal">
                  {producto.categoria}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="font-mono text-[12.5px] tabular-nums">
              {producto.precio !== null ? (
                formatCurrency(producto.precio)
              ) : (
                <span className="text-muted-foreground">Consultar</span>
              )}
            </TableCell>
            <TableCell>
              <button
                type="button"
                role="switch"
                aria-checked={producto.activo}
                aria-label={
                  producto.activo
                    ? `Ocultar ${producto.nombre} de la web`
                    : `Publicar ${producto.nombre} en la web`
                }
                disabled={alternar.isPending}
                onClick={(event) => {
                  // Evita disparar también el clic de la fila.
                  event.stopPropagation()
                  alternar.mutate({
                    id: producto.id,
                    activo: !producto.activo,
                  })
                }}
                className={cn(
                  "relative h-5 w-[34px] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  producto.activo ? "bg-primary" : "bg-muted-foreground/25"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-[left] duration-200",
                    producto.activo ? "left-[16px]" : "left-0.5"
                  )}
                />
              </button>
            </TableCell>
            <TableCell className="hidden font-mono text-[12.5px] tabular-nums text-muted-foreground lg:table-cell">
              {formatDate(producto.created_at)}
            </TableCell>
            <TableCell className="py-1.5 text-right">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                aria-label={`Editar ${producto.nombre}`}
                onClick={(event) => {
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
