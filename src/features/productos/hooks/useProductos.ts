import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  BUCKET_PRODUCTOS,
  rutaEnBucket,
} from "@/features/productos/hooks/useSubirImagen"
import type { ProductoInput } from "@/features/productos/schema"
import type { Producto } from "@/features/productos/types"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/shared/hooks/use-toast"

const QUERY_KEY_PRODUCTOS = ["productos", "listado"] as const

/** Texto vacío → null, para que la base guarde null (y el trigger autogenere el slug). */
function aNulo(valor: string) {
  const recortado = valor.trim()
  return recortado === "" ? null : recortado
}

/**
 * Campos del formulario → fila de `productos`. `medida` no se incluye: la
 * calcula el trigger `productos_normalizar` desde largo × ancho × alto.
 */
function aFilaProducto(datos: ProductoInput) {
  return {
    nombre: datos.nombre,
    slug: aNulo(datos.slug),
    categoria: aNulo(datos.categoria),
    descripcion: aNulo(datos.descripcion),
    largo: datos.largo,
    ancho: datos.ancho,
    alto: datos.alto,
    precio: datos.precio,
    unidad_minima: datos.unidad_minima,
    desc_x100: datos.desc_x100,
    desc_x250: datos.desc_x250,
    desc_x500: datos.desc_x500,
    tipo_carton: aNulo(datos.tipo_carton),
    plazo_entrega: aNulo(datos.plazo_entrega),
    admite_impresion: datos.admite_impresion,
    imagen_url: aNulo(datos.imagen_url),
    activo: datos.activo,
    destacado: datos.destacado,
  }
}

export function useProductos() {
  return useQuery({
    queryKey: QUERY_KEY_PRODUCTOS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("nombre", { ascending: true })

      if (error) throw error
      return data
    },
  })
}

type AlternarVisibilidadArgs = {
  id: string
  activo: boolean
}

/**
 * Publica/oculta un producto desde el switch de la tabla, con actualización
 * optimista: el switch responde al instante y se revierte si la base falla.
 */
export function useAlternarVisibilidad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, activo }: AlternarVisibilidadArgs) => {
      const { error } = await supabase
        .from("productos")
        .update({ activo })
        .eq("id", id)

      if (error) throw error
    },
    onMutate: async ({ id, activo }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY_PRODUCTOS })
      const previo = queryClient.getQueryData<Producto[]>(QUERY_KEY_PRODUCTOS)

      queryClient.setQueryData<Producto[]>(QUERY_KEY_PRODUCTOS, (productos) =>
        productos?.map((p) => (p.id === id ? { ...p, activo } : p))
      )

      return { previo }
    },
    onError: (error, _variables, contexto) => {
      if (contexto?.previo) {
        queryClient.setQueryData(QUERY_KEY_PRODUCTOS, contexto.previo)
      }
      toast({
        title: "No se pudo cambiar la visibilidad",
        description: "Intentá de nuevo o contactá al administrador.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTOS })
    },
  })
}

export function useCrearProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (datos: ProductoInput) => {
      // `medida` es NOT NULL sin default, así que el tipo generado la exige en
      // el insert. Va vacía a propósito: el trigger `productos_normalizar`
      // (BEFORE INSERT) la reescribe desde largo × ancho × alto.
      const { error } = await supabase
        .from("productos")
        .insert({ ...aFilaProducto(datos), medida: "" })

      if (error) throw error
    },
    onSuccess: () => {
      toast({ title: "Producto creado" })
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTOS })
    },
    onError: (error) => {
      toast({
        title: "Error al crear el producto",
        description: "Intentá de nuevo o contactá al administrador.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}

type ActualizarProductoArgs = {
  id: string
  datos: ProductoInput
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, datos }: ActualizarProductoArgs) => {
      const { error } = await supabase
        .from("productos")
        .update(aFilaProducto(datos))
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      toast({ title: "Producto actualizado" })
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTOS })
    },
    onError: (error) => {
      toast({
        title: "Error al guardar",
        description: "Intentá de nuevo o contactá al administrador.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}

/** Postgres: violación de clave foránea (el producto está usado en remitos). */
const FK_VIOLATION = "23503"

/** El producto está en algún remito, así que la base no deja borrarlo. */
export class ProductoEnUsoError extends Error {
  constructor() {
    super("El producto está usado en remitos")
    this.name = "ProductoEnUsoError"
  }
}

/**
 * Borra el producto y, si tenía foto propia, el archivo del bucket.
 *
 * `items_remito` referencia `productos` con ON DELETE RESTRICT: un producto
 * que ya salió en un remito NO se puede borrar (si no, el historial quedaría
 * apuntando a la nada). En ese caso se lanza `ProductoEnUsoError` para que la
 * UI ofrezca ocultarlo en vez de mostrar un error sin salida.
 */
export function useEliminarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (producto: Producto) => {
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id", producto.id)

      if (error) {
        if (error.code === FK_VIOLATION) throw new ProductoEnUsoError()
        throw error
      }

      // La fila ya no está: si la foto queda huérfana, se borra. Un fallo acá
      // no revierte el borrado, así que no se propaga (solo deja un archivo).
      const ruta = rutaEnBucket(producto.imagen_url)
      if (ruta) {
        const { error: errorFoto } = await supabase.storage
          .from(BUCKET_PRODUCTOS)
          .remove([ruta])
        if (errorFoto && import.meta.env.DEV) console.error(errorFoto)
      }
    },
    onSuccess: () => {
      toast({ title: "Producto eliminado" })
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTOS })
    },
    onError: (error) => {
      // El caso "está en uso" lo resuelve la UI con el diálogo, no un toast.
      if (error instanceof ProductoEnUsoError) return

      toast({
        title: "No se pudo eliminar el producto",
        description: "Intentá de nuevo o contactá al administrador.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}

/**
 * Categorías ya usadas en el catálogo, únicas y ordenadas.
 *
 * Sale del mismo listado que ya está en caché (no agrega un viaje a la base):
 * sirve para sugerirlas al cargar un producto y evitar que se dupliquen por
 * diferencias de tipeo.
 */
export function useCategorias() {
  const { data: productos } = useProductos()

  return useMemo(() => {
    if (!productos) return []

    const unicas = [
      ...new Set(
        productos
          .map((p) => p.categoria)
          .filter((c): c is string => c !== null && c.trim() !== "")
      ),
    ]

    return unicas.sort((a, b) => a.localeCompare(b, "es"))
  }, [productos])
}
