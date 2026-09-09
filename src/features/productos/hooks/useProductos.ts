import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
