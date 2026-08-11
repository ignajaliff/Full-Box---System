import { useMemo, useState } from "react"
import { Wallet } from "lucide-react"

import { CobroDialog } from "@/features/finanzas/components/CobroDialog"
import {
  PendientesPorCliente,
  type GrupoPendiente,
} from "@/features/finanzas/components/PendientesPorCliente"
import { TablaCobros } from "@/features/finanzas/components/TablaCobros"
import {
  useCobros,
  usePendientesCobro,
  type RemitoPendiente,
} from "@/features/finanzas/hooks/useFinanzas"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export default function FinanzasPage() {
  const pendientes = usePendientesCobro()
  const cobros = useCobros()
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [cobrando, setCobrando] = useState<RemitoPendiente[] | null>(null)

  const grupos = useMemo<GrupoPendiente[]>(() => {
    if (!pendientes.data) return []

    const porCliente = new Map<string, GrupoPendiente>()
    for (const remito of pendientes.data) {
      const grupo = porCliente.get(remito.cliente_id) ?? {
        clienteId: remito.cliente_id,
        razonSocial: remito.cliente?.razon_social ?? "Cliente",
        remitos: [],
      }
      grupo.remitos.push(remito)
      porCliente.set(remito.cliente_id, grupo)
    }

    return [...porCliente.values()].sort((a, b) =>
      a.razonSocial.localeCompare(b.razonSocial, "es")
    )
  }, [pendientes.data])

  function handleToggle(remitoId: string) {
    setSeleccionados((previos) => {
      const nuevos = new Set(previos)
      if (nuevos.has(remitoId)) {
        nuevos.delete(remitoId)
      } else {
        nuevos.add(remitoId)
      }
      return nuevos
    })
  }

  function handleCobrar(grupo: GrupoPendiente) {
    const elegidos = grupo.remitos.filter((remito) =>
      seleccionados.has(remito.id)
    )
    if (elegidos.length > 0) setCobrando(elegidos)
  }

  function handleCerrarCobro() {
    setCobrando(null)
    setSeleccionados(new Set())
  }

  const cargando = pendientes.isLoading || cobros.isLoading
  const conError = pendientes.isError || cobros.isError

  return (
    <div className="space-y-8 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Finanzas</h1>
        <p className="text-sm text-muted-foreground">
          Cobros de remitos entregados e historial de ingresos.
        </p>
      </header>

      {conError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los datos. Intentá recargar la página.
        </p>
      ) : null}

      {cargando ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      ) : null}

      {pendientes.data ? (
        <section className="space-y-4" aria-label="Remitos pendientes de cobro">
          <h2 className="text-lg font-medium">Pendientes de cobro</h2>

          {grupos.length > 0 ? (
            <PendientesPorCliente
              grupos={grupos}
              seleccionados={seleccionados}
              onToggle={handleToggle}
              onCobrar={handleCobrar}
            />
          ) : (
            <Card className="rounded-xl">
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <Wallet
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">Nada pendiente de cobro</p>
                <p className="text-sm text-muted-foreground">
                  Los remitos entregados y sin cobrar van a aparecer acá,
                  agrupados por cliente.
                </p>
              </div>
            </Card>
          )}
        </section>
      ) : null}

      {cobros.data ? (
        <section className="space-y-4" aria-label="Historial de cobros">
          <h2 className="text-lg font-medium">Historial de cobros</h2>

          {cobros.data.length > 0 ? (
            <Card className="overflow-hidden rounded-xl">
              <TablaCobros cobros={cobros.data} />
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no hay cobros registrados.
            </p>
          )}
        </section>
      ) : null}

      {cobrando ? (
        <CobroDialog remitos={cobrando} onCerrar={handleCerrarCobro} />
      ) : null}
    </div>
  )
}
