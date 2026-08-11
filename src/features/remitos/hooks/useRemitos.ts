import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { RemitoInput } from "@/features/remitos/schema"
import type { EstadoRemito } from "@/features/remitos/types"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/shared/hooks/use-toast"

const QUERY_KEY_REMITOS = ["remitos", "listado"] as const

/** Select con joins que usan Remitos y Finanzas. */
export const SELECT_REMITO_DETALLE =
  "*, cliente:clientes(razon_social), items:items_remito(id, cantidad, precio_unitario, producto:productos(id, nombre, medida, precio))"

async function obtenerRemitos() {
  const { data, error } = await supabase
    .from("remitos")
    .select(SELECT_REMITO_DETALLE)
    .order("numero", { ascending: false })

  if (error) throw error
  return data
}

/** Remito con cliente e items (incluye el producto de cada item). */
export type RemitoDetalle = Awaited<ReturnType<typeof obtenerRemitos>>[number]

export function useRemitos() {
  return useQuery({
    queryKey: QUERY_KEY_REMITOS,
    queryFn: obtenerRemitos,
  })
}

export function useCrearRemito() {
  const queryClient = useQueryClient()

  return useMutation({
    // RPC transaccional: remito + items se crean todo-o-nada.
    mutationFn: async (datos: RemitoInput) => {
      const { error } = await supabase.rpc("crear_remito", {
        p_cliente_id: datos.cliente_id,
        p_items: datos.items,
        p_notas: datos.notas.trim() || undefined,
      })

      if (error) throw error
    },
    onSuccess: () => {
      toast({ title: "Remito creado" })
      queryClient.invalidateQueries({ queryKey: ["remitos"] })
      queryClient.invalidateQueries({ queryKey: ["finanzas"] })
    },
    onError: (error) => {
      toast({
        title: "Error al crear el remito",
        description: "Intentá de nuevo o contactá al administrador.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}

type CambiarEstadoArgs = {
  id: string
  estado: EstadoRemito
}

export function useCambiarEstadoRemito() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, estado }: CambiarEstadoArgs) => {
      const { error } = await supabase
        .from("remitos")
        .update({ estado })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: (_datos, { estado }) => {
      toast({
        title: estado === "anulado" ? "Remito anulado" : "Estado actualizado",
      })
      queryClient.invalidateQueries({ queryKey: ["remitos"] })
      queryClient.invalidateQueries({ queryKey: ["finanzas"] })
    },
    onError: (error) => {
      toast({
        title: "No se pudo cambiar el estado",
        description: "Intentá de nuevo o contactá al administrador.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}
