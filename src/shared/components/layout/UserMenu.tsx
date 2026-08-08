import { LogOut } from "lucide-react"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

function obtenerIniciales(nombre: string) {
  return nombre.trim().slice(0, 2).toUpperCase() || "FB"
}

export function UserMenu() {
  const { usuario, cerrarSesion } = useAuth()

  if (!usuario) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Abrir menú de usuario"
      >
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {obtenerIniciales(usuario.nombre)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{usuario.nombre}</p>
          <p className="truncate text-xs text-sidebar-muted-foreground">
            {usuario.email}
          </p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="capitalize">
          {usuario.rol}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void cerrarSesion()
          }}
        >
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
