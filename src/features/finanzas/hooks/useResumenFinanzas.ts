import { useMemo } from "react"

import {
  useCobros,
  usePendientesCobro,
  type RemitoPendiente,
} from "@/features/finanzas/hooks/useFinanzas"
import type { Indicador } from "@/shared/components/layout/FilaIndicadores"
import { formatCurrency } from "@/shared/utils/formatCurrency"

export type GrupoPendiente = {
  clienteId: string
  razonSocial: string
  remitos: RemitoPendiente[]
}

/**
 * Datos compartidos por las dos subpáginas de Finanzas: los pendientes
 * agrupados por cliente y la fila de indicadores. Las dos vistas muestran el
 * mismo resumen, así que el cálculo vive acá y no duplicado en cada página.
 */
export function useResumenFinanzas() {
  const pendientes = usePendientesCobro()
  const cobros = useCobros()

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

  const indicadores = useMemo<Indicador[] | null>(() => {
    if (!pendientes.data || !cobros.data) return null

    const totalCobrado = cobros.data.reduce(
      (suma, cobro) => suma + cobro.total,
      0
    )
    const ultimo = cobros.data[0]

    return [
      {
        etiqueta: "Pendientes de cobro",
        valor: String(pendientes.data.length),
        detalle: `de ${grupos.length} cliente${grupos.length === 1 ? "" : "s"}`,
      },
      {
        etiqueta: "Cobros registrados",
        valor: String(cobros.data.length),
        detalle: "en el historial",
      },
      {
        etiqueta: "Total cobrado",
        valor: formatCurrency(totalCobrado),
        detalle: "acumulado histórico",
      },
      {
        etiqueta: "Último cobro",
        valor: ultimo ? formatCurrency(ultimo.total) : "—",
        detalle: ultimo?.cliente?.razon_social ?? "sin cobros todavía",
      },
    ]
  }, [pendientes.data, cobros.data, grupos.length])

  return {
    pendientes,
    cobros,
    grupos,
    indicadores,
    cargando: pendientes.isLoading || cobros.isLoading,
    conError: pendientes.isError || cobros.isError,
  }
}
