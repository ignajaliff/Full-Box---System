import { z } from "zod"

/**
 * Campos editables del producto. `medida` NO se edita: la autogenera el
 * trigger `productos_normalizar` desde largo × ancho × alto. El slug vacío
 * también se autogenera (desde el nombre).
 */

const dimensionCm = z
  .number({ invalid_type_error: "Ingresá un número" })
  .positive("Debe ser mayor a 0")
  .nullable()

const porcentaje = z
  .number({ invalid_type_error: "Ingresá un número" })
  .min(0, "Mínimo 0%")
  .max(100, "Máximo 100%")

export const productoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "Ingresá el nombre del producto")
    .max(80, "El nombre no puede superar los 80 caracteres"),
  slug: z
    .string()
    .trim()
    .max(80, "El slug no puede superar los 80 caracteres")
    .refine(
      (valor) => valor === "" || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(valor),
      "Solo minúsculas, números y guiones (ej. caja-para-vinos)"
    ),
  categoria: z.string().trim().max(40, "Máximo 40 caracteres"),
  descripcion: z.string().trim().max(500, "Máximo 500 caracteres"),

  largo: dimensionCm,
  ancho: dimensionCm,
  alto: dimensionCm,

  precio: z
    .number({ invalid_type_error: "Ingresá un número" })
    .min(0, "El precio no puede ser negativo")
    .nullable(),
  unidad_minima: z
    .number({ invalid_type_error: "Ingresá un número" })
    .int("Debe ser un número entero")
    .min(1, "Mínimo 1 unidad"),
  desc_x100: porcentaje,
  desc_x250: porcentaje,
  desc_x500: porcentaje,

  tipo_carton: z.string().trim().max(80, "Máximo 80 caracteres"),
  plazo_entrega: z.string().trim().max(40, "Máximo 40 caracteres"),
  admite_impresion: z.boolean(),

  imagen_url: z
    .string()
    .trim()
    .refine(
      (valor) => valor === "" || /^https?:\/\/.+/.test(valor),
      "Debe ser una URL (https://…)"
    ),
  activo: z.boolean(),
  destacado: z.boolean(),
})

export type ProductoInput = z.infer<typeof productoSchema>
