import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ProductoInput } from "@/features/productos/schema"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/shared/hooks/use-toast"

const QUERY_KEY_PRODUCTOS = ["productos", "listado"] as const

/** Texto vacío → null, para que la base guarde null (y el trigger autogenere el slug). */
function aNulo(valor: string) {
  const recortado = valor.trim()
  return recortado === "" ? null : recortado
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

type ActualizarProductoArgs = {
  id: string
  datos: ProductoInput
}

export function useActualizarProducto() {
  const queryClient = useQueryClient()

  return useMutation({
    // `medida` no se envía: la calcula el trigger desde largo × ancho × alto.
    mutationFn: async ({ id, datos }: ActualizarProductoArgs) => {
      const { error } = await supabase
        .from("productos")
        .update({
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
        })
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
