import type { Control } from "react-hook-form"

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
import { Textarea } from "@/shared/components/ui/textarea"

type CamposGeneralesProps = {
  control: Control<ProductoInput>
}

/** Sección "Información" + "Dimensiones" del formulario de producto. */
export function CamposGenerales({ control }: CamposGeneralesProps) {
  return (
    <>
      <section className="space-y-4">
        <h3 className="text-[11.5px] font-semibold text-muted-foreground">
          Información
        </h3>

        <FormField
          control={control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="Ej. E-commerce"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="Se genera solo si queda vacío"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Descripción que se muestra en la ficha del producto"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      <section className="space-y-4 border-t pt-5">
        <h3 className="text-[11.5px] font-semibold text-muted-foreground">
          Dimensiones (cm)
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <CampoNumerico control={control} name="largo" etiqueta="Largo" />
          <CampoNumerico control={control} name="ancho" etiqueta="Ancho" />
          <CampoNumerico control={control} name="alto" etiqueta="Alto" />
        </div>

        <p className="text-sm text-muted-foreground">
          La medida visible (ej. «30 × 20 × 15 cm») se arma sola con estos tres
          valores.
        </p>
      </section>
    </>
  )
}
