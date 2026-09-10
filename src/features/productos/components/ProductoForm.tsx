import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { CamposComerciales } from "@/features/productos/components/CamposComerciales"
import { CamposGenerales } from "@/features/productos/components/CamposGenerales"
import { productoSchema, type ProductoInput } from "@/features/productos/schema"
import type { Producto } from "@/features/productos/types"
import { Button } from "@/shared/components/ui/button"
import { DialogFooter } from "@/shared/components/ui/dialog"
import { Form } from "@/shared/components/ui/form"

type ProductoFormProps = {
  /** null = alta de un producto nuevo. */
  producto: Producto | null
  guardando: boolean
  onGuardar: (datos: ProductoInput) => void
  onCancelar: () => void
  /** Solo en edición: abre la confirmación de borrado. */
  onEliminar?: () => void
}

export function ProductoForm({
  producto,
  guardando,
  onGuardar,
  onCancelar,
  onEliminar,
}: ProductoFormProps) {
  const form = useForm<ProductoInput>({
    resolver: zodResolver(productoSchema),
    // En el alta arranca visible y sin destacar; las dimensiones y el precio
    // quedan vacíos (null) porque son opcionales hasta que se sepan.
    defaultValues: {
      nombre: producto?.nombre ?? "",
      slug: producto?.slug ?? "",
      categoria: producto?.categoria ?? "",
      descripcion: producto?.descripcion ?? "",
      largo: producto?.largo ?? null,
      ancho: producto?.ancho ?? null,
      alto: producto?.alto ?? null,
      precio: producto?.precio ?? null,
      unidad_minima: producto?.unidad_minima ?? 1,
      desc_x100: producto?.desc_x100 ?? 0,
      desc_x250: producto?.desc_x250 ?? 0,
      desc_x500: producto?.desc_x500 ?? 0,
      tipo_carton: producto?.tipo_carton ?? "",
      plazo_entrega: producto?.plazo_entrega ?? "",
      admite_impresion: producto?.admite_impresion ?? false,
      imagen_url: producto?.imagen_url ?? "",
      activo: producto?.activo ?? true,
      destacado: producto?.destacado ?? false,
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

        {/* Eliminar va en su propia fila, lejos de Guardar: es destructivo y
            no tiene que quedar pegado al botón que se usa todo el tiempo. */}
        {onEliminar ? (
          <div className="border-t border-hairline px-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEliminar}
              disabled={guardando}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 aria-hidden="true" />
              Eliminar producto
            </Button>
          </div>
        ) : null}

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
            ) : producto ? (
              "Guardar cambios"
            ) : (
              "Crear producto"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
