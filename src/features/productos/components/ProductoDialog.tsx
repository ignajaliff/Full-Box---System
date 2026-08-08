import { ProductoForm } from "@/features/productos/components/ProductoForm"
import { useActualizarProducto } from "@/features/productos/hooks/useProductos"
import type { ProductoInput } from "@/features/productos/schema"
import type { Producto } from "@/features/productos/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type ProductoDialogProps = {
  /** Producto en edición; null cierra el modal. */
  producto: Producto | null
  onCerrar: () => void
}

export function ProductoDialog({ producto, onCerrar }: ProductoDialogProps) {
  const mutation = useActualizarProducto()

  function handleGuardar(datos: ProductoInput) {
    if (!producto) return

    mutation.mutate({ id: producto.id, datos }, { onSuccess: onCerrar })
  }

  return (
    <Dialog
      open={producto !== null}
      onOpenChange={(abierto) => {
        if (!abierto && !mutation.isPending) onCerrar()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>
            Modificá los datos del producto y guardá los cambios.
          </DialogDescription>
        </DialogHeader>

        {producto ? (
          <ProductoForm
            // Reinicia el formulario al cambiar de producto.
            key={producto.id}
            producto={producto}
            guardando={mutation.isPending}
            onGuardar={handleGuardar}
            onCancelar={onCerrar}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
