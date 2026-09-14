import { AppRoutes } from "@/app/AppRoutes"
import { Providers } from "@/app/Providers"
import { AvisoVersionNueva } from "@/shared/components/layout/AvisoVersionNueva"
import { ErrorBoundary } from "@/shared/components/layout/ErrorBoundary"
import { PaginaError } from "@/shared/components/layout/PaginaError"

export function App() {
  return (
    <ErrorBoundary fallback={<PaginaError />}>
      <Providers>
        <AppRoutes />
        <AvisoVersionNueva />
      </Providers>
    </ErrorBoundary>
  )
}
