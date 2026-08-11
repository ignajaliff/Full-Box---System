import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { ProtectedRoute } from "@/app/ProtectedRoute"
import { RutaPublica } from "@/app/RutaPublica"
import {
  RUTA_CLIENTES,
  RUTA_DASHBOARD,
  RUTA_FINANZAS,
  RUTA_LOGIN,
  RUTA_PRODUCTOS,
  RUTA_REMITOS,
} from "@/app/rutas"
import { AppLayout } from "@/shared/components/layout/AppLayout"
import { PantallaCarga } from "@/shared/components/layout/PantallaCarga"

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage")
)
const ProductosPage = lazy(
  () => import("@/features/productos/pages/ProductosPage")
)
const ClientesPage = lazy(
  () => import("@/features/clientes/pages/ClientesPage")
)
const RemitosPage = lazy(() => import("@/features/remitos/pages/RemitosPage"))
const FinanzasPage = lazy(
  () => import("@/features/finanzas/pages/FinanzasPage")
)

export function AppRoutes() {
  return (
    <Suspense fallback={<PantallaCarga />}>
      <Routes>
        <Route
          path={RUTA_LOGIN}
          element={
            <RutaPublica>
              <LoginPage />
            </RutaPublica>
          }
        />

        {/* Rutas autenticadas: comparten el navegador lateral (AppLayout). */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={RUTA_DASHBOARD} element={<DashboardPage />} />
          <Route path={RUTA_PRODUCTOS} element={<ProductosPage />} />
          <Route path={RUTA_CLIENTES} element={<ClientesPage />} />
          <Route path={RUTA_REMITOS} element={<RemitosPage />} />
          <Route path={RUTA_FINANZAS} element={<FinanzasPage />} />
        </Route>

        <Route path="/" element={<Navigate to={RUTA_DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={RUTA_DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  )
}
