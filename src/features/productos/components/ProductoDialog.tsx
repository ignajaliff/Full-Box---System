import { ProductoForm } from "@/features/productos/components/ProductoForm"
import {
  useActualizarProducto,
  useCrearProducto,
} from "@/features/productos/hooks/useProductos"
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
  abierto: boolean
  /** null = alta de un producto nuevo. */
  producto: Producto | null
  onCerrar: () => void
}

export function ProductoDialog({
  abierto,
  producto,
  onCerrar,
}: ProductoDialogProps) {
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const guardando = crear.isPending || actualizar.isPending

  function handleGuardar(datos: ProductoInput) {
    if (producto) {
      actualizar.mutate({ id: producto.id, datos }, { onSuccess: onCerrar })
    } else {
      crear.mutate(datos, { onSuccess: onCerrar })
    }
  }

  return (
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
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
