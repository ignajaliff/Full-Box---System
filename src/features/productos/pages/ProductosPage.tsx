import { useMemo, useState } from "react"
import { PackageSearch, Search } from "lucide-react"

import { ProductoDialog } from "@/features/productos/components/ProductoDialog"
import { TablaProductos } from "@/features/productos/components/TablaProductos"
import { useProductos } from "@/features/productos/hooks/useProductos"
import type { Producto } from "@/features/productos/types"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

const FILAS_SKELETON = 5

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").trim()
}

export default function ProductosPage() {
  const { data: productos, isLoading, isError } = useProductos()
  const [busqueda, setBusqueda] = useState("")
  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(
    null
  )

  const filtrados = useMemo(() => {
    if (!productos) return []
    const termino = normalizar(busqueda)
    if (!termino) return productos

    return productos.filter(
      (producto) =>
        normalizar(producto.nombre).includes(termino) ||
        normalizar(producto.medida).includes(termino) ||
        normalizar(producto.categoria ?? "").includes(termino)
    )
  }, [productos, busqueda])

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Productos</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de cajas de la fábrica.
        </p>
      </header>

      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los productos. Intentá recargar la página.
        </p>
      ) : (
        <Card className="overflow-hidden rounded-xl">
          {/* Barra de búsqueda del catálogo */}
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, medida o categoría…"
              aria-label="Buscar productos"
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {productos ? (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {filtrados.length} de {productos.length}
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: FILAS_SKELETON }).map((_, indice) => (
                <Skeleton key={indice} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {productos && filtrados.length > 0 ? (
            <TablaProductos
              productos={filtrados}
              onEditar={setProductoEnEdicion}
            />
          ) : null}

          {productos && filtrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <PackageSearch
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">
                {productos.length === 0
                  ? "Todavía no hay productos cargados"
                  : `Sin resultados para «${busqueda.trim()}»`}
              </p>
              <p className="text-sm text-muted-foreground">
                {productos.length === 0
                  ? "Los productos que se carguen van a aparecer acá."
                  : "Probá con otro nombre u otra medida."}
              </p>
            </div>
          ) : null}
        </Card>
      )}

      <ProductoDialog
        producto={productoEnEdicion}
        onCerrar={() => setProductoEnEdicion(null)}
      />
    </div>
  )
}
