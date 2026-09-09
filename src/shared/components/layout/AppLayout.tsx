import { Suspense } from "react"
import { Outlet } from "react-router-dom"

import { CargaContenido } from "@/shared/components/layout/CargaContenido"
import { Sidebar } from "@/shared/components/layout/Sidebar"

/**
 * Shell de las páginas autenticadas: navegador lateral fijo a la izquierda
 * y el contenido de la ruta activa a la derecha (vía <Outlet />).
 *
 * Layout a ras (2026-08-17): sin fondo shell ni tarjetas flotantes — el
 * sidebar y el contenido ocupan la pantalla completa y los separa una sola
 * línea vertical (el borde derecho del sidebar).
 *
 * El Suspense va ACÁ (no alrededor de las rutas) para que al navegar entre
 * páginas lazy el sidebar nunca se desmonte: solo carga el contenido.
 */
export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<CargaContenido />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
