import { z } from "zod"

import { METODOS_COBRO } from "@/features/finanzas/types"

const VALORES_METODO = METODOS_COBRO.map((opcion) => opcion.valor)

export const cobroSchema = z
  .object({
    metodo: z
      .string()
      .refine((valor) => (VALORES_METODO as string[]).includes(valor), {
        message: "Elegí un método de cobro",
      }),
    nro_factura: z.string().trim().max(40, "Máximo 40 caracteres"),
    notas: z.string().trim().max(300, "Máximo 300 caracteres"),
    // Un precio por cada item de los remitos seleccionados. El campo vacío
    // llega como null y se rechaza con error inline en ese item.
    precios: z
      .array(
        z.object({
          item_id: z.string(),
          precio: z
            .number({ invalid_type_error: "Ingresá el precio" })
            .min(0, "El precio no puede ser negativo")
            .nullable(),
        })
      )
      .superRefine((filas, contexto) => {
        filas.forEach((fila, indice) => {
          if (fila.precio === null) {
            contexto.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Ingresá el precio",
              path: [indice, "precio"],
            })
          }
        })
      }),
  })

export type CobroInput = z.infer<typeof cobroSchema>
