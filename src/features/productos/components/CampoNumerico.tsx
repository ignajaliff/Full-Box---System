import type { Control } from "react-hook-form"

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

/** Campos numéricos del schema de producto. */
type NombreCampoNumerico =
  | "largo"
  | "ancho"
  | "alto"
  | "precio"
  | "unidad_minima"
  | "desc_x100"
  | "desc_x250"
  | "desc_x500"

type CampoNumericoProps = {
  control: Control<ProductoInput>
  name: NombreCampoNumerico
  etiqueta: string
  descripcion?: string
  step?: string
}

/**
 * Input numérico integrado con RHF: el campo vacío se guarda como null
 * (los schemas requeridos lo rechazan con su propio mensaje).
 */
export function CampoNumerico({
  control,
  name,
  etiqueta,
  descripcion,
  step = "0.01",
}: CampoNumericoProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{etiqueta}</FormLabel>
          <FormControl>
            <Input
              type="number"
              inputMode="decimal"
              step={step}
              min="0"
              value={field.value ?? ""}
              onChange={(event) => {
                const valor = event.target.valueAsNumber
                field.onChange(Number.isNaN(valor) ? null : valor)
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          {descripcion ? (
            <FormDescription>{descripcion}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
