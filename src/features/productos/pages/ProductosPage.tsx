import { useMemo, useState } from "react"
import { PackageSearch, Plus } from "lucide-react"

import { CajaPersonalizada } from "@/features/productos/components/CajaPersonalizada"
import { ProductoDialog } from "@/features/productos/components/ProductoDialog"
import { TablaProductos } from "@/features/productos/components/TablaProductos"
import { useProductos } from "@/features/productos/hooks/useProductos"
import type { Producto } from "@/features/productos/types"
import {
  BarraFiltros,
  ChipsFiltro,
} from "@/shared/components/layout/BarraFiltros"
import { PaginaConEncabezado } from "@/shared/components/layout/PaginaConEncabezado"
import { EstadoVacio } from "@/shared/components/layout/EstadoVacio"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

const FILAS_SKELETON = 5

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").trim()
}

export default function ProductosPage() {
  const { data: productos, isLoading, isError } = useProductos()
  const [busqueda, setBusqueda] = useState("")
  // null = todas las categorías.
  const [categoria, setCategoria] = useState<string | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  // null con el diálogo abierto = alta de un producto nuevo.
  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(
    null
  )

  function abrirAlta() {
    setProductoEnEdicion(null)
    setDialogoAbierto(true)
  }

  function abrirEdicion(producto: Producto) {
    setProductoEnEdicion(producto)
    setDialogoAbierto(true)
  }

  const categorias = useMemo(() => {
    if (!productos) return []
    const unicas = [
      ...new Set(
        productos
          .map((p) => p.categoria)
          .filter((c): c is string => c !== null && c.trim() !== "")
      ),
    ]
    return unicas.sort((a, b) => a.localeCompare(b, "es"))
  }, [productos])

  const filtrados = useMemo(() => {
    if (!productos) return []
    const termino = normalizar(busqueda)

    return productos.filter((producto) => {
      if (categoria !== null && producto.categoria !== categoria) return false
      if (!termino) return true

      return (
        normalizar(producto.nombre).includes(termino) ||
        normalizar(producto.medida).includes(termino) ||
        normalizar(producto.categoria ?? "").includes(termino)
      )
    })
  }, [productos, busqueda, categoria])

  return (
    <PaginaConEncabezado
      titulo="Productos"
      descripcion="Catálogo de cajas de la fábrica."
      acciones={
        <Button size="sm" className="h-9" onClick={abrirAlta}>
          <Plus aria-hidden="true" />
          Crear producto
        </Button>
      }
    >
      <CajaPersonalizada />

      <BarraFiltros
        busqueda={busqueda}
        onBuscar={setBusqueda}
        placeholder="Buscar por nombre, medida o categoría…"
        etiquetaBusqueda="Buscar productos"
        contador={
          productos
            ? `${filtrados.length} de ${productos.length} productos`
            : undefined
        }
      >
        <ChipsFiltro
          opciones={categorias}
          seleccionada={categoria}
          onSeleccionar={setCategoria}
          etiquetaGrupo="Filtrar por categoría"
        />
      </BarraFiltros>

      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los productos. Intentá recargar la página.
        </p>
      ) : (
        <Card className="overflow-hidden rounded-xl">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: FILAS_SKELETON }).map((_, indice) => (
                <Skeleton key={indice} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {productos && filtrados.length > 0 ? (
            <TablaProductos productos={filtrados} onEditar={abrirEdicion} />
          ) : null}

          {productos && filtrados.length === 0 ? (
            <EstadoVacio
              icono={PackageSearch}
              titulo={
                productos.length === 0
                  ? "Todavía no hay productos cargados"
                  : "Sin resultados para esa búsqueda"
              }
              descripcion={
                productos.length === 0
                  ? "Creá el primero con el botón «Crear producto»."
                  : "Probá con otro nombre, medida o categoría."
              }
            />
          ) : null}
        </Card>
      )}

      <ProductoDialog
        abierto={dialogoAbierto}
        producto={productoEnEdicion}
        onCerrar={() => setDialogoAbierto(false)}
      />
    </PaginaConEncabezado>
  )
}
