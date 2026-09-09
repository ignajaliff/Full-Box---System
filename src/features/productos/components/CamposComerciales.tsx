import type { Control } from "react-hook-form"

import { CampoBooleano } from "@/features/productos/components/CampoBooleano"
import { CampoNumerico } from "@/features/productos/components/CampoNumerico"
import type { ProductoInput } from "@/features/productos/schema"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"

type CamposComercialesProps = {
  control: Control<ProductoInput>
}

/** Secciones "Comercial", "Producción" y "Web" del formulario de producto. */
export function CamposComerciales({ control }: CamposComercialesProps) {
  return (
    <>
      <section className="space-y-4 border-t pt-5">
        <h3 className="text-[11.5px] font-semibold text-muted-foreground">
          Comercial
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoNumerico
            control={control}
            name="precio"
            etiqueta="Precio desde ($)"
            descripcion="Vacío = se muestra «Consultar»"
          />
          <CampoNumerico
            control={control}
            name="unidad_minima"
            etiqueta="Unidad mínima"
            descripcion="Cantidad mínima de venta"
            step="1"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <CampoNumerico
            control={control}
            name="desc_x100"
            etiqueta="Desc. 100+ (%)"
          />
          <CampoNumerico
            control={control}
            name="desc_x250"
            etiqueta="Desc. 250+ (%)"
          />
          <CampoNumerico
            control={control}
            name="desc_x500"
            etiqueta="Desc. 500+ (%)"
          />
        </div>
      </section>

      <section className="space-y-4 border-t pt-5">
        <h3 className="text-[11.5px] font-semibold text-muted-foreground">
          Producción
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="tipo_carton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de cartón</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="Ej. Corrugado simple, kraft"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="plazo_entrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo de entrega</FormLabel>
                <FormControl>
                  <Input autoComplete="off" placeholder="Ej. 72 hs" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <CampoBooleano
          control={control}
          name="admite_impresion"
          etiqueta="Admite impresión"
          descripcion="Se puede imprimir la marca del cliente en la caja."
        />
      </section>

      <section className="space-y-4 border-t pt-5">
        <h3 className="text-[11.5px] font-semibold text-muted-foreground">
          Web
        </h3>

        <FormField
          control={control}
          name="imagen_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagen (URL)</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="https://…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoBooleano
            control={control}
            name="activo"
            etiqueta="Visible en la web"
            descripcion="Desactivado = oculto en la landing sin borrarlo."
          />
          <CampoBooleano
            control={control}
            name="destacado"
            etiqueta="Destacado"
            descripcion="Aparece en la home («los más pedidos»)."
          />
        </div>
      </section>
    </>
  )
}
