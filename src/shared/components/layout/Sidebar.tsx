import { NavLink } from "react-router-dom"

import logoFullBox from "@/assets/logogrisoscuro.png"
import { ITEMS_NAVEGACION } from "@/app/navegacion"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/shared/components/layout/UserMenu"

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col gap-1.5 px-5 py-5">
        <img
          src={logoFullBox}
          alt="Full Box"
          className="h-11 w-auto self-start"
        />
        <p className="text-xs text-sidebar-muted-foreground">
          Gestión de fábrica
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Navegación principal">
        {ITEMS_NAVEGACION.map((item) => {
          const Icono = item.icono

          if (item.proximamente) {
            return (
              <span
                key={item.ruta}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-sidebar-muted-foreground"
              >
                <span className="flex items-center gap-3">
                  <Icono className="h-4 w-4" aria-hidden="true" />
                  {item.etiqueta}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  Pronto
                </span>
              </span>
            )
          }

          return (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Icono className="h-4 w-4" aria-hidden="true" />
              {item.etiqueta}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <UserMenu />
      </div>
    </aside>
  )
}
