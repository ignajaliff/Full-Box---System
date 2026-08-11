import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ClienteInput } from "@/features/clientes/schema"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/shared/hooks/use-toast"

const QUERY_KEY_CLIENTES = ["clientes", "listado"] as const

/** Texto vacío → null, para que la base guarde null (y el UNIQUE de cuit no choque con ""). */
function aNulo(valor: string) {
  const recortado = valor.trim()
  return recortado === "" ? null : recortado
}

function aFilaCliente(datos: ClienteInput) {
  return {
    razon_social: datos.razon_social,
    cuit: aNulo(datos.cuit),
    condicion_iva: aNulo(datos.condicion_iva),
    telefono: aNulo(datos.telefono),
    email: aNulo(datos.email),
    direccion_entrega: aNulo(datos.direccion_entrega),
  }
}

/** El UNIQUE de cuit devuelve el código 23505 cuando ya existe. */
function describirErrorGuardado(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  ) {
    return "Ya existe un cliente con ese CUIT."
  }
  return "Intentá de nuevo o contactá al administrador."
}

export function useClientes() {
  return useQuery({
    queryKey: QUERY_KEY_CLIENTES,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("razon_social", { ascending: true })

      if (error) throw error
      return data
    },
  })
}

export function useCrearCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (datos: ClienteInput) => {
      const { error } = await supabase
        .from("clientes")
        .insert(aFilaCliente(datos))

      if (error) throw error
    },
    onSuccess: () => {
      toast({ title: "Cliente creado" })
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_CLIENTES })
    },
    onError: (error) => {
      toast({
        title: "Error al crear el cliente",
        description: describirErrorGuardado(error),
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}

type ActualizarClienteArgs = {
  id: string
  datos: ClienteInput
}

export function useActualizarCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, datos }: ActualizarClienteArgs) => {
      const { error } = await supabase
        .from("clientes")
        .update(aFilaCliente(datos))
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      toast({ title: "Cliente actualizado" })
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_CLIENTES })
    },
    onError: (error) => {
      toast({
        title: "Error al guardar",
        description: describirErrorGuardado(error),
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}
