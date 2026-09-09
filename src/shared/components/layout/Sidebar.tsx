import { NavLink, useLocation } from "react-router-dom"

import logoFullBox from "@/assets/logogrisoscuro.png"
import { ITEMS_NAVEGACION, type ItemNavegacion } from "@/app/navegacion"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/shared/components/layout/UserMenu"

const CLASE_ITEM =
  "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] transition-colors"

// Activo: el cartón entra como DETALLE (texto, icono y barra lateral), no
// como bloque de color.
const CLASE_ITEM_ACTIVO =
  "bg-sidebar-accent font-semibold text-sidebar-primary before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-sidebar-primary"

const CLASE_ITEM_INACTIVO =
  "font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

/** Item con subpáginas: se despliegan cuando el módulo está activo. */
function ItemConSubitems({ item }: { item: ItemNavegacion }) {
  const { pathname } = useLocation()
  const Icono = item.icono
  // El módulo está activo en su ruta y en la de cualquier subpágina.
  const activo = pathname.startsWith(item.ruta)

  return (
    <div>
      <NavLink
        to={item.ruta}
        className={cn(CLASE_ITEM, activo ? CLASE_ITEM_ACTIVO : CLASE_ITEM_INACTIVO)}
      >
        <Icono className="h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        {item.etiqueta}
      </NavLink>

      {activo ? (
        // Indentado bajo el icono del padre, con una guía vertical que los
        // agrupa visualmente.
        <ul className="ml-[19px] mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2.5">
          {item.subitems?.map((subitem) => (
            <li key={subitem.ruta}>
              <NavLink
                to={subitem.ruta}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors",
                    isActive
                      ? "font-semibold text-sidebar-primary"
                      : "font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                {subitem.etiqueta}
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/**
 * Navegador lateral sobre el gris oscuro del logo.
 *
 * Sin tarjeta propia: el borde derecho es la única línea que lo separa del
 * contenido. Al ser una superficie OSCURA usa exclusivamente los tokens
 * `sidebar-*` — los globales (muted, accent, hairline) están calibrados para
 * fondo claro y acá no se leerían.
 */
export function Sidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Altura FIJA: su línea inferior tiene que coincidir con la del
          encabezado de las páginas (ver EncabezadoPagina). */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border">
        {/* El logo se pasa a blanco: su gris original es justo el color de
            esta superficie (no existe un PNG blanco del logo). */}
        <img
          src={logoFullBox}
          alt="Full Box"
          className="w-[92px] brightness-0 invert"
        />
      </div>

      <p className="px-4 pb-0.5 pt-3 text-[10.5px] font-semibold tracking-[0.08em] text-sidebar-muted-foreground">
        MENÚ PRINCIPAL
      </p>

      <nav className="flex-1 space-y-0.5 px-3.5 pt-1" aria-label="Navegación principal">
        {ITEMS_NAVEGACION.map((item) => {
          const Icono = item.icono

          if (item.proximamente) {
            return (
              <span
                key={item.ruta}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium text-sidebar-muted-foreground"
              >
                <span className="flex items-center gap-2.5">
                  <Icono
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  {item.etiqueta}
                </span>
                <span className="rounded bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sidebar-accent-foreground">
                  Pronto
                </span>
              </span>
            )
          }

          if (item.subitems) {
            return <ItemConSubitems key={item.ruta} item={item} />
          }

          return (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                cn(CLASE_ITEM, isActive ? CLASE_ITEM_ACTIVO : CLASE_ITEM_INACTIVO)
              }
            >
              <Icono
                className="h-4 w-4 shrink-0"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              {item.etiqueta}
            </NavLink>
          )
        })}
      </nav>

      <div className="mx-3.5 border-t border-sidebar-border py-3">
        <UserMenu />
      </div>
    </aside>
  )
}
