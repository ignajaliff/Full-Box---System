import { Button } from "@/shared/components/ui/button"

export function PaginaError() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Algo salió mal
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocurrió un error inesperado. Recargá la página; si el problema
        continúa, contactá al administrador del sistema.
      </p>
      <Button onClick={() => window.location.reload()}>Recargar página</Button>
    </main>
  )
}
