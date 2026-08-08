import { Outlet } from "react-router-dom"

import { Sidebar } from "@/shared/components/layout/Sidebar"

/**
 * Shell de las páginas autenticadas: navegador lateral fijo a la izquierda
 * y el contenido de la ruta activa a la derecha (vía <Outlet />).
 */
export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* Fondo levemente gris: separa el contenido del sidebar blanco. */}
      <main className="flex-1 overflow-y-auto bg-muted">
        <Outlet />
      </main>
    </div>
  )
}
