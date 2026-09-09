import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { CamposComerciales } from "@/features/productos/components/CamposComerciales"
import { CamposGenerales } from "@/features/productos/components/CamposGenerales"
import { productoSchema, type ProductoInput } from "@/features/productos/schema"
import type { Producto } from "@/features/productos/types"
import { Button } from "@/shared/components/ui/button"
import { DialogFooter } from "@/shared/components/ui/dialog"
import { Form } from "@/shared/components/ui/form"

type ProductoFormProps = {
  producto: Producto
  guardando: boolean
  onGuardar: (datos: ProductoInput) => void
  onCancelar: () => void
}

export function ProductoForm({
  producto,
  guardando,
  onGuardar,
  onCancelar,
}: ProductoFormProps) {
  const form = useForm<ProductoInput>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: producto.nombre,
      slug: producto.slug ?? "",
      categoria: producto.categoria ?? "",
      descripcion: producto.descripcion ?? "",
      largo: producto.largo,
      ancho: producto.ancho,
      alto: producto.alto,
      precio: producto.precio,
      unidad_minima: producto.unidad_minima,
      desc_x100: producto.desc_x100,
      desc_x250: producto.desc_x250,
      desc_x500: producto.desc_x500,
      tipo_carton: producto.tipo_carton ?? "",
      plazo_entrega: producto.plazo_entrega ?? "",
      admite_impresion: producto.admite_impresion,
      imagen_url: producto.imagen_url ?? "",
      activo: producto.activo,
      destacado: producto.destacado,
    },
  })

  return (
    <Form {...form}>
      {/* Columna del panel lateral: los campos scrollean, el pie queda fijo. */}
      <form
        onSubmit={form.handleSubmit(onGuardar)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <CamposGenerales control={form.control} />
          <CamposComerciales control={form.control} />
        </div>

        <DialogFooter className="border-t border-hairline p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={guardando}
            className="sm:flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando} className="sm:flex-1">
            {guardando ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
