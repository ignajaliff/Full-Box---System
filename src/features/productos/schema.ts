import { z } from "zod"

import { MAX_TRAMOS } from "@/features/productos/types"

/**
 * Campos editables del producto. `medida` NO se edita: la autogenera el
 * trigger `productos_normalizar` desde largo × ancho × alto. El slug vacío
 * también se autogenera (desde el nombre).
 */

const dimensionCm = z
  .number({ invalid_type_error: "Ingresá un número" })
  .positive("Debe ser mayor a 0")
  .nullable()

/** Un tramo de precio por cantidad: desde `cantidad` unidades, vale `precio`. */
const tramoSchema = z.object({
  cantidad: z
    .number({ invalid_type_error: "Ingresá la cantidad" })
    .int("Debe ser un número entero")
    .positive("Debe ser mayor a 0"),
  precio: z
    .number({ invalid_type_error: "Ingresá el precio" })
    .min(0, "El precio no puede ser negativo"),
})

export const productoSchema = z
  .object({
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
    tramos: z
      .array(tramoSchema)
      .max(MAX_TRAMOS, `Hasta ${MAX_TRAMOS} tramos`),

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
  // Reglas que cruzan campos: cada tramo supera la unidad mínima y no se
  // repite. El orden no se exige acá — se ordenan al guardar.
  .superRefine((datos, ctx) => {
    const vistas = new Set<number>()

    datos.tramos.forEach((tramo, indice) => {
      // Un campo vacío llega como null en runtime: ya lo marcó su propio schema.
      if (typeof tramo.cantidad !== "number") return

      if (
        typeof datos.unidad_minima === "number" &&
        tramo.cantidad <= datos.unidad_minima
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tramos", indice, "cantidad"],
          message: `Tiene que superar la unidad mínima (${datos.unidad_minima})`,
        })
      }

      if (vistas.has(tramo.cantidad)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tramos", indice, "cantidad"],
          message: "Esa cantidad ya está en otro tramo",
        })
      }
      vistas.add(tramo.cantidad)
    })
  })

export type ProductoInput = z.infer<typeof productoSchema>
