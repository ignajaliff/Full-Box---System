import { Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { RUTA_INICIO } from "@/app/rutas"
import { PantallaCarga } from "@/shared/components/layout/PantallaCarga"

/**
 * Rutas que no deben verse con la sesión abierta (el login).
 * Si ya hay sesión, manda al inicio del sistema.
 */
export function RutaPublica({ children }: { children: ReactNode }) {
  const { estaAutenticado, cargando } = useAuth()

  if (cargando) return <PantallaCarga />

  if (estaAutenticado) return <Navigate to={RUTA_INICIO} replace />

  return <>{children}</>
}
