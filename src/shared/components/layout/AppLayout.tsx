import { Suspense } from "react"
import { Outlet } from "react-router-dom"

import { CargaContenido } from "@/shared/components/layout/CargaContenido"
import { Sidebar } from "@/shared/components/layout/Sidebar"

/**
 * Shell de las páginas autenticadas: navegador lateral fijo a la izquierda
 * y el contenido de la ruta activa a la derecha (vía <Outlet />).
 *
 * El Suspense va ACÁ (no alrededor de las rutas) para que al navegar entre
 * páginas lazy el sidebar nunca se desmonte: solo carga el contenido.
 */
export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* Fondo levemente gris: separa el contenido del sidebar blanco. */}
      <main className="flex-1 overflow-y-auto bg-muted">
        <Suspense fallback={<CargaContenido />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
