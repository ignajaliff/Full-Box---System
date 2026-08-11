import { z } from "zod"

import { CONDICIONES_IVA } from "@/features/clientes/types"

export const clienteSchema = z.object({
  razon_social: z
    .string()
    .trim()
    .min(1, "Ingresá el nombre o razón social")
    .max(120, "Máximo 120 caracteres"),
  cuit: z
    .string()
    .trim()
    .refine(
      (valor) => valor === "" || /^\d{2}-?\d{8}-?\d$/.test(valor),
      "CUIT inválido (ej. 30-12345678-9)"
    ),
  condicion_iva: z
    .string()
    .refine(
      (valor) =>
        valor === "" || (CONDICIONES_IVA as readonly string[]).includes(valor),
      "Condición de IVA inválida"
    ),
  telefono: z.string().trim().max(30, "Máximo 30 caracteres"),
  email: z
    .string()
    .trim()
    .refine(
      (valor) => valor === "" || z.string().email().safeParse(valor).success,
      "Email inválido"
    ),
  direccion_entrega: z.string().trim().max(200, "Máximo 200 caracteres"),
})

export type ClienteInput = z.infer<typeof clienteSchema>
