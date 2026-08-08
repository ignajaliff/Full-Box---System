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
      <form onSubmit={form.handleSubmit(onGuardar)} className="space-y-5">
        <CamposGenerales control={form.control} />
        <CamposComerciales control={form.control} />

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
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
