import type { Control } from "react-hook-form"

import type { ProductoInput } from "@/features/productos/schema"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form"

type NombreCampoBooleano = "activo" | "destacado" | "admite_impresion"

type CampoBooleanoProps = {
  control: Control<ProductoInput>
  name: NombreCampoBooleano
  etiqueta: string
  descripcion: string
}

export function CampoBooleano({
  control,
  name,
  etiqueta,
  descripcion,
}: CampoBooleanoProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start gap-3 rounded-md border p-4">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{etiqueta}</FormLabel>
            <FormDescription>{descripcion}</FormDescription>
          </div>
        </FormItem>
      )}
    />
  )
}
