import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Wallet } from "lucide-react"

import { RUTA_FINANZAS_HISTORIAL } from "@/app/rutas"
import { CobroVista } from "@/features/finanzas/components/CobroVista"
import { PendientesPorCliente } from "@/features/finanzas/components/PendientesPorCliente"
import type { RemitoPendiente } from "@/features/finanzas/hooks/useFinanzas"
import {
  useResumenFinanzas,
  type GrupoPendiente,
} from "@/features/finanzas/hooks/useResumenFinanzas"
import { EstadoVacio } from "@/shared/components/layout/EstadoVacio"
import {
  FilaIndicadores,
  FilaIndicadoresSkeleton,
} from "@/shared/components/layout/FilaIndicadores"
import { PaginaConEncabezado } from "@/shared/components/layout/PaginaConEncabezado"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export default function PendientesPage() {
  const navigate = useNavigate()
  const { pendientes, grupos, indicadores, cargando, conError } =
    useResumenFinanzas()
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [cobrando, setCobrando] = useState<RemitoPendiente[] | null>(null)

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

  function handleToggleGrupo(grupo: GrupoPendiente, marcar: boolean) {
    setSeleccionados((previos) => {
      const nuevos = new Set(previos)
      for (const remito of grupo.remitos) {
        if (marcar) {
          nuevos.add(remito.id)
        } else {
          nuevos.delete(remito.id)
        }
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

  function handleCancelarCobro() {
    setCobrando(null)
  }

  // Cobro confirmado: el remito ya no está pendiente, así que volver acá no
  // mostraría nada. Se va al historial, donde quedó registrado.
  function handleCobroConfirmado() {
    setCobrando(null)
    setSeleccionados(new Set())
    navigate(RUTA_FINANZAS_HISTORIAL)
  }

  // El cobro REEMPLAZA el contenido de la página (el sidebar sigue visible):
  // congela precios y es irreversible, así que ocupa toda el área útil.
  if (cobrando) {
    return (
      <CobroVista
        remitos={cobrando}
        onCancelar={handleCancelarCobro}
        onConfirmado={handleCobroConfirmado}
      />
    )
  }

  return (
    <PaginaConEncabezado
      titulo="Pendientes de cobro"
      descripcion="Remitos entregados y sin cobrar, agrupados por cliente."
    >
      {conError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los datos. Intentá recargar la página.
        </p>
      ) : null}

      {cargando ? (
        <>
          <FilaIndicadoresSkeleton />
          <Skeleton className="h-44 w-full rounded-xl" />
        </>
      ) : null}

      {indicadores ? (
        <FilaIndicadores
          indicadores={indicadores}
          etiquetaAccesible="Resumen financiero"
        />
      ) : null}

      {pendientes.data ? (
        grupos.length > 0 ? (
          <PendientesPorCliente
            grupos={grupos}
            seleccionados={seleccionados}
            onToggle={handleToggle}
            onToggleGrupo={handleToggleGrupo}
            onCobrar={handleCobrar}
          />
        ) : (
          <Card className="rounded-xl">
            <EstadoVacio
              icono={Wallet}
              titulo="Nada pendiente de cobro"
              descripcion="Los remitos entregados y sin cobrar van a aparecer acá, agrupados por cliente."
            />
          </Card>
        )
      ) : null}
    </PaginaConEncabezado>
  )
}
