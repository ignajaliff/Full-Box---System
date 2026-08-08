import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresá tu email")
    .email("El email no tiene un formato válido"),
  // Solo se exige que no esté vacía: la política de largo la valida Supabase
  // al crear la contraseña. Pedir un mínimo acá rechazaría una contraseña
  // legítima creada antes de endurecer la política.
  password: z.string().min(1, "Ingresá tu contraseña"),
})

export type LoginInput = z.infer<typeof loginSchema>
