import { Navigate, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import { SinAutorizacion } from "@/features/auth/components/SinAutorizacion"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { Rol } from "@/features/auth/types"
import { RUTA_INICIO, RUTA_LOGIN } from "@/app/rutas"
import { PantallaCarga } from "@/shared/components/layout/PantallaCarga"

type ProtectedRouteProps = {
  children: ReactNode
  /** Si se omite, alcanza con estar autenticado. */
  requiredRole?: Rol[]
}

/**
 * Barrera perimetral de UX: evita que se cargue una ruta sin sesión o sin el
 * rol necesario. La seguridad real es el RLS de Supabase, no este componente.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { estaAutenticado, cargando, sinAutorizacion, tieneRol } = useAuth()
  const location = useLocation()

  if (cargando) return <PantallaCarga />

  if (sinAutorizacion) return <SinAutorizacion />

  if (!estaAutenticado) {
    return (
      <Navigate to={RUTA_LOGIN} replace state={{ from: location.pathname }} />
    )
  }

  if (requiredRole && !tieneRol(requiredRole)) {
    return <Navigate to={RUTA_INICIO} replace />
  }

  return <>{children}</>
}
