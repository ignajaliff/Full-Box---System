import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { SELECT_REMITO_DETALLE } from "@/features/remitos/hooks/useRemitos"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/shared/hooks/use-toast"

const QUERY_KEY_PENDIENTES = ["finanzas", "pendientes"] as const
const QUERY_KEY_COBROS = ["finanzas", "cobros"] as const

/** Remitos entregados y sin cobro: lo que se puede cobrar hoy. */
async function obtenerPendientesCobro() {
  const { data, error } = await supabase
    .from("remitos")
    .select(SELECT_REMITO_DETALLE)
    .eq("estado", "entregado")
    .is("cobro_id", null)
    .order("numero", { ascending: true })

  if (error) throw error
  return data
}

export type RemitoPendiente = Awaited<
  ReturnType<typeof obtenerPendientesCobro>
>[number]

export function usePendientesCobro() {
  return useQuery({
    queryKey: QUERY_KEY_PENDIENTES,
    queryFn: obtenerPendientesCobro,
  })
}

async function obtenerCobros() {
  const { data, error } = await supabase
    .from("cobros")
    .select("*, cliente:clientes(razon_social)")
    .order("numero", { ascending: false })

  if (error) throw error
  return data
}

export type CobroDetalle = Awaited<ReturnType<typeof obtenerCobros>>[number]

export function useCobros() {
  return useQuery({
    queryKey: QUERY_KEY_COBROS,
    queryFn: obtenerCobros,
  })
}

type CobrarRemitosArgs = {
  remitoIds: string[]
  metodo: string
  /** item_id → precio congelado para ese item. */
  precios: Record<string, number>
  nroFactura?: string
  notas?: string
}

export function useCobrarRemitos() {
  const queryClient = useQueryClient()

  return useMutation({
    // RPC transaccional: valoriza items, crea el cobro y vincula los
    // remitos, todo-o-nada.
    mutationFn: async (datos: CobrarRemitosArgs) => {
      const { error } = await supabase.rpc("cobrar_remitos", {
        p_remito_ids: datos.remitoIds,
        p_metodo: datos.metodo,
        p_precios: datos.precios,
        p_nro_factura: datos.nroFactura,
        p_notas: datos.notas,
      })

      if (error) throw error
    },
    onSuccess: () => {
      toast({ title: "Cobro registrado" })
      queryClient.invalidateQueries({ queryKey: ["finanzas"] })
      queryClient.invalidateQueries({ queryKey: ["remitos"] })
    },
    onError: (error) => {
      toast({
        title: "No se pudo registrar el cobro",
        description: "Intentá de nuevo o contactá al administrador.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}
