import { ShieldAlert } from "lucide-react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/shared/components/ui/button"

/**
 * El usuario se autenticó pero no tiene un rol asignado en user_roles.
 * Sin esta pantalla volvería al login sin explicación.
 */
export function SinAutorizacion() {
  const { cerrarSesion } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <ShieldAlert className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </span>
      <h1 className="text-xl font-semibold tracking-tight">
        Tu cuenta no tiene acceso al sistema
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Iniciaste sesión correctamente, pero todavía no tenés un rol asignado.
        Pedile al administrador que habilite tu cuenta.
      </p>
      <Button variant="outline" onClick={() => void cerrarSesion()}>
        Cerrar sesión
      </Button>
    </main>
  )
}
