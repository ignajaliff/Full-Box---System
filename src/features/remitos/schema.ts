import { z } from "zod"

export const remitoSchema = z.object({
  cliente_id: z.string().min(1, "Elegí un cliente"),
  notas: z.string().trim().max(500, "Máximo 500 caracteres"),
  items: z
    .array(
      z.object({
        producto_id: z.string().min(1, "Elegí un producto"),
        cantidad: z
          .number({ invalid_type_error: "Ingresá la cantidad" })
          .int("Debe ser un número entero")
          .min(1, "Mínimo 1"),
      })
    )
    .min(1, "Agregá al menos un producto")
    .refine(
      (items) =>
        new Set(items.map((item) => item.producto_id)).size === items.length,
      "Hay productos repetidos en el remito"
    ),
})

export type RemitoInput = z.infer<typeof remitoSchema>
