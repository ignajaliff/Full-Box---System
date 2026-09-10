import { useState } from "react"

import { ProductoForm } from "@/features/productos/components/ProductoForm"
import {
  ProductoEnUsoError,
  useActualizarProducto,
  useAlternarVisibilidad,
  useCrearProducto,
  useEliminarProducto,
} from "@/features/productos/hooks/useProductos"
import type { ProductoInput } from "@/features/productos/schema"
import type { Producto } from "@/features/productos/types"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type ProductoDialogProps = {
  abierto: boolean
  /** null = alta de un producto nuevo. */
  producto: Producto | null
  onCerrar: () => void
}

/** Paso de la confirmación: borrar, o —si está en uso— ofrecer ocultar. */
type Confirmacion = "borrar" | "en-uso"

export function ProductoDialog({
  abierto,
  producto,
  onCerrar,
}: ProductoDialogProps) {
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const eliminar = useEliminarProducto()
  const ocultar = useAlternarVisibilidad()
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)

  const guardando = crear.isPending || actualizar.isPending
  const procesando = eliminar.isPending || ocultar.isPending

  function handleGuardar(datos: ProductoInput) {
    if (producto) {
      actualizar.mutate({ id: producto.id, datos }, { onSuccess: onCerrar })
    } else {
      crear.mutate(datos, { onSuccess: onCerrar })
    }
  }

  function handleEliminar() {
    if (!producto) return

    eliminar.mutate(producto, {
      onSuccess: () => {
        setConfirmacion(null)
        onCerrar()
      },
      // La base rechaza borrar un producto que ya salió en un remito: en vez
      // de un error sin salida, se ofrece ocultarlo de la web.
      onError: (error) => {
        if (error instanceof ProductoEnUsoError) setConfirmacion("en-uso")
      },
    })
  }

  function handleOcultar() {
    if (!producto) return

    ocultar.mutate(
      { id: producto.id, activo: false },
      {
        onSuccess: () => {
          setConfirmacion(null)
          onCerrar()
        },
      }
    )
  }

  return (
    <>
      <Dialog
        open={abierto}
        onOpenChange={(estaAbierto) => {
          if (!estaAbierto && !guardando) onCerrar()
        }}
      >
        {/* Mismo ancho que el panel de remitos: las dos columnas del
            formulario necesitan espacio. */}
        <DialogContent variante="panel" className="sm:max-w-2xl">
          <DialogHeader className="border-b border-hairline px-5 py-4">
            <DialogTitle>
              {producto ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
            <DialogDescription>
              {producto
                ? "Modificá los datos del producto y guardá los cambios."
                : "Cargá los datos del producto. Solo el nombre es obligatorio."}
            </DialogDescription>
          </DialogHeader>

          {/* Solo con el panel abierto: así el formulario se monta con los
              valores del producto (o los del alta) y no queda vivo detrás. */}
          {abierto ? (
            <ProductoForm
              // Remonta el formulario al cambiar de producto (o pasar a alta).
              key={producto?.id ?? "nuevo"}
              producto={producto}
              guardando={guardando}
              onGuardar={handleGuardar}
              onCancelar={onCerrar}
              onEliminar={
                producto ? () => setConfirmacion("borrar") : undefined
              }
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Confirmación de borrado (irreversible) */}
      <Dialog
        open={confirmacion !== null}
        onOpenChange={(estaAbierto) => {
          if (!estaAbierto && !procesando) setConfirmacion(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmacion === "en-uso"
                ? "No se puede eliminar"
                : `¿Eliminar ${producto?.nombre ?? "el producto"}?`}
            </DialogTitle>
            <DialogDescription>
              {confirmacion === "en-uso"
                ? "El producto ya figura en remitos, así que borrarlo dejaría ese historial incompleto. Podés ocultarlo: deja de verse en la web y en la landing, pero los remitos quedan intactos."
                : "Se elimina del catálogo junto con su foto. No se puede deshacer."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmacion(null)}
              disabled={procesando}
            >
              Cancelar
            </Button>
            {confirmacion === "en-uso" ? (
              <Button onClick={handleOcultar} disabled={procesando}>
                Ocultar de la web
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleEliminar}
                disabled={procesando}
              >
                Eliminar producto
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
