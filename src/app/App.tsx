import { AppRoutes } from "@/app/AppRoutes"
import { Providers } from "@/app/Providers"
import { ErrorBoundary } from "@/shared/components/layout/ErrorBoundary"
import { PaginaError } from "@/shared/components/layout/PaginaError"

export function App() {
  return (
    <ErrorBoundary fallback={<PaginaError />}>
      <Providers>
        <AppRoutes />
      </Providers>
    </ErrorBoundary>
  )
}
