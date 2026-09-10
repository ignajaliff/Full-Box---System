import { useId } from "react"
import type { Control } from "react-hook-form"

import { useCategorias } from "@/features/productos/hooks/useProductos"
import type { ProductoInput } from "@/features/productos/schema"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"

type CampoCategoriaProps = {
  control: Control<ProductoInput>
}

/**
 * Categoría del producto: sugiere las que ya existen en el catálogo pero deja
 * escribir una nueva.
 *
 * Va con `datalist` nativo en vez del `Combobox`: ese es de lista cerrada
 * (resuelve la etiqueta buscando el valor entre las opciones) y acá hace falta
 * poder inventar categorías. Sugerir las existentes evita que se dupliquen por
 * diferencias de tipeo.
 */
export function CampoCategoria({ control }: CampoCategoriaProps) {
  const categorias = useCategorias()
  // El id tiene que ser único: el formulario puede montarse más de una vez.
  const listaId = useId()

  return (
    <FormField
      control={control}
      name="categoria"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoría</FormLabel>
          <FormControl>
            <Input
              autoComplete="off"
              list={listaId}
              placeholder="Ej. E-commerce"
              {...field}
            />
          </FormControl>

          <datalist id={listaId}>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria} />
            ))}
          </datalist>

          <FormDescription>
            {categorias.length > 0
              ? "Elegí una de las existentes o escribí una nueva."
              : "Escribí la primera categoría del catálogo."}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
