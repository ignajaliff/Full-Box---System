import { useMutation } from "@tanstack/react-query"
import { AuthError } from "@supabase/supabase-js"
import { useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "@/features/auth/hooks/useAuth"
import type { LoginInput } from "@/features/auth/schema"
import { RUTA_INICIO } from "@/app/rutas"
import { toast } from "@/shared/hooks/use-toast"

/**
 * Traduce el error de Supabase a un mensaje para el usuario final.
 * Nunca mostrar el mensaje interno de Supabase tal cual.
 */
function describirError(error: Error) {
  if (error instanceof AuthError) {
    if (error.code === "email_not_confirmed") {
      return "Tu email todavía no está confirmado. Revisá tu casilla."
    }
    if (error.code === "over_request_rate_limit") {
      return "Demasiados intentos. Esperá unos minutos e intentá de nuevo."
    }
  }

  return "Revisá tu email y contraseña e intentá de nuevo."
}

export function useIniciarSesion() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const destino =
    (location.state as { from?: string } | null)?.from ?? RUTA_INICIO

  return useMutation({
    mutationFn: async (credenciales: LoginInput) => {
      await iniciarSesion(credenciales)
    },
    onSuccess: () => {
      navigate(destino, { replace: true })
    },
    onError: (error: Error) => {
      toast({
        title: "No pudimos iniciar sesión",
        description: describirError(error),
        variant: "destructive",
      })

      if (import.meta.env.DEV) console.error(error)
    },
  })
}
