import { useMemo, useState } from "react"
import { Receipt } from "lucide-react"

import { TablaCobros } from "@/features/finanzas/components/TablaCobros"
import { useResumenFinanzas } from "@/features/finanzas/hooks/useResumenFinanzas"
import { etiquetaMetodo, formatNumeroCobro } from "@/features/finanzas/types"
import { BarraFiltros } from "@/shared/components/layout/BarraFiltros"
import { EstadoVacio } from "@/shared/components/layout/EstadoVacio"
import {
  FilaIndicadores,
  FilaIndicadoresSkeleton,
} from "@/shared/components/layout/FilaIndicadores"
import { PaginaConEncabezado } from "@/shared/components/layout/PaginaConEncabezado"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

export default function HistorialPage() {
  const { cobros, indicadores, cargando, conError } = useResumenFinanzas()
  const [busqueda, setBusqueda] = useState("")

  const filtrados = useMemo(() => {
    if (!cobros.data) return []

    const termino = busqueda.trim().toLowerCase()
    if (termino === "") return cobros.data

    return cobros.data.filter((cobro) =>
      [
        formatNumeroCobro(cobro.numero),
        cobro.cliente?.razon_social ?? "",
        etiquetaMetodo(cobro.metodo),
        cobro.nro_factura ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(termino)
    )
  }, [cobros.data, busqueda])

  return (
    <PaginaConEncabezado
      titulo="Historial de cobros"
      descripcion="Cobros registrados. Clickeá un cobro para ver su desglose."
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

      {cobros.data ? (
        cobros.data.length > 0 ? (
          <>
            <BarraFiltros
              busqueda={busqueda}
              onBuscar={setBusqueda}
              placeholder="Buscar por N°, cliente, método o factura"
              etiquetaBusqueda="Buscar cobros"
              contador={`${filtrados.length} de ${cobros.data.length} cobro${cobros.data.length === 1 ? "" : "s"}`}
            />

            {filtrados.length > 0 ? (
              <Card className="overflow-hidden rounded-xl">
                <TablaCobros cobros={filtrados} />
              </Card>
            ) : (
              <Card className="rounded-xl">
                <EstadoVacio
                  icono={Receipt}
                  titulo="Sin resultados"
                  descripcion="Ningún cobro coincide con la búsqueda."
                />
              </Card>
            )}
          </>
        ) : (
          <Card className="rounded-xl">
            <EstadoVacio
              icono={Receipt}
              titulo="Todavía no hay cobros"
              descripcion="Los cobros que registres desde «Pendientes de cobro» van a aparecer acá."
            />
          </Card>
        )
      ) : null}
    </PaginaConEncabezado>
  )
}
