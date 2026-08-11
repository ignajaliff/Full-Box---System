import { useMemo, useState } from "react"
import { Plus, Search, Users } from "lucide-react"

import { ClienteDialog } from "@/features/clientes/components/ClienteDialog"
import { TablaClientes } from "@/features/clientes/components/TablaClientes"
import { useClientes } from "@/features/clientes/hooks/useClientes"
import type { Cliente } from "@/features/clientes/types"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

const FILAS_SKELETON = 5

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").trim()
}

export default function ClientesPage() {
  const { data: clientes, isLoading, isError } = useClientes()
  const [busqueda, setBusqueda] = useState("")
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [clienteEnEdicion, setClienteEnEdicion] = useState<Cliente | null>(null)

  const filtrados = useMemo(() => {
    if (!clientes) return []
    const termino = normalizar(busqueda)
    if (!termino) return clientes

    return clientes.filter((cliente) =>
      [
        cliente.razon_social,
        cliente.cuit ?? "",
        cliente.email ?? "",
        cliente.telefono ?? "",
      ].some((campo) => normalizar(campo).includes(termino))
    )
  }, [clientes, busqueda])

  function abrirAlta() {
    setClienteEnEdicion(null)
    setDialogoAbierto(true)
  }

  function abrirEdicion(cliente: Cliente) {
    setClienteEnEdicion(cliente)
    setDialogoAbierto(true)
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Registro de clientes de la fábrica, base para remitos y facturación.
          </p>
        </div>
        <Button onClick={abrirAlta}>
          <Plus aria-hidden="true" />
          Nuevo cliente
        </Button>
      </header>

      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los clientes. Intentá recargar la página.
        </p>
      ) : (
        <Card className="overflow-hidden rounded-xl">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por nombre, CUIT, email o teléfono…"
              aria-label="Buscar clientes"
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {clientes ? (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {filtrados.length} de {clientes.length}
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: FILAS_SKELETON }).map((_, indice) => (
                <Skeleton key={indice} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {clientes && filtrados.length > 0 ? (
            <TablaClientes clientes={filtrados} onEditar={abrirEdicion} />
          ) : null}

          {clientes && filtrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <Users
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">
                {clientes.length === 0
                  ? "Todavía no hay clientes cargados"
                  : `Sin resultados para «${busqueda.trim()}»`}
              </p>
              <p className="text-sm text-muted-foreground">
                {clientes.length === 0
                  ? "Creá el primero con el botón «Nuevo cliente»."
                  : "Probá con otro nombre, CUIT o teléfono."}
              </p>
            </div>
          ) : null}
        </Card>
      )}

      <ClienteDialog
        abierto={dialogoAbierto}
        cliente={clienteEnEdicion}
        onCerrar={() => setDialogoAbierto(false)}
      />
    </div>
  )
}
