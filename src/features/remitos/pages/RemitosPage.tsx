import { useMemo, useState } from "react"
import { FileText, Plus } from "lucide-react"

import { RemitoDialog } from "@/features/remitos/components/RemitoDialog"
import { TablaRemitos } from "@/features/remitos/components/TablaRemitos"
import {
  useCambiarEstadoRemito,
  useRemitos,
  type RemitoDetalle,
} from "@/features/remitos/hooks/useRemitos"
import {
  ESTADO_SIGUIENTE,
  ESTADOS_REMITO,
  ETIQUETA_ESTADO,
  esEstadoRemito,
  formatNumeroRemito,
  type EstadoRemito,
} from "@/features/remitos/types"
import {
  BarraFiltros,
  ChipsFiltro,
} from "@/shared/components/layout/BarraFiltros"
import { EstadoVacio } from "@/shared/components/layout/EstadoVacio"
import {
  FilaIndicadores,
  FilaIndicadoresSkeleton,
  type Indicador,
} from "@/shared/components/layout/FilaIndicadores"
import { PaginaConEncabezado } from "@/shared/components/layout/PaginaConEncabezado"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Skeleton } from "@/shared/components/ui/skeleton"

const FILAS_SKELETON = 5

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").trim()
}

export default function RemitosPage() {
  const { data: remitos, isLoading, isError } = useRemitos()
  const cambiarEstado = useCambiarEstadoRemito()
  const [busqueda, setBusqueda] = useState("")
  // null = todos los estados.
  const [filtroEstado, setFiltroEstado] = useState<EstadoRemito | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  // null con el diálogo abierto = alta de un remito nuevo.
  const [remitoEnEdicion, setRemitoEnEdicion] = useState<RemitoDetalle | null>(
    null
  )
  const [anulando, setAnulando] = useState<RemitoDetalle | null>(null)

  const filtrados = useMemo(() => {
    if (!remitos) return []
    const termino = normalizar(busqueda)

    return remitos.filter((remito) => {
      if (filtroEstado !== null && remito.estado !== filtroEstado) return false
      if (!termino) return true
      return (
        normalizar(remito.cliente?.razon_social ?? "").includes(termino) ||
        normalizar(formatNumeroRemito(remito.numero)).includes(termino) ||
        remito.numero.toString().includes(termino)
      )
    })
  }, [remitos, busqueda, filtroEstado])

  const resumen = useMemo<Indicador[] | null>(() => {
    if (!remitos) return null

    const contar = (estado: EstadoRemito) =>
      remitos.filter((remito) => remito.estado === estado).length
    const pendientesCobro = remitos.filter(
      (remito) => remito.estado === "entregado" && remito.cobro_id === null
    ).length

    return [
      {
        etiqueta: "Remitos activos",
        valor: String(
          remitos.filter((remito) => remito.estado !== "anulado").length
        ),
        detalle: "sin contar anulados",
      },
      {
        etiqueta: ETIQUETA_ESTADO.nuevo,
        valor: String(contar("nuevo")),
        detalle: "sin empezar",
      },
      {
        etiqueta: ETIQUETA_ESTADO.preparando,
        valor: String(contar("preparando")),
        detalle: "en la fábrica",
      },
      {
        etiqueta: "Pendientes de cobro",
        valor: String(pendientesCobro),
        detalle: "entregados sin cobrar",
      },
    ]
  }, [remitos])

  function abrirAlta() {
    setRemitoEnEdicion(null)
    setDialogoAbierto(true)
  }

  function abrirEdicion(remito: RemitoDetalle) {
    setRemitoEnEdicion(remito)
    setDialogoAbierto(true)
  }

  function handleAvanzar(remito: RemitoDetalle) {
    if (!esEstadoRemito(remito.estado)) return
    const siguiente = ESTADO_SIGUIENTE[remito.estado]
    if (siguiente) cambiarEstado.mutate({ id: remito.id, estado: siguiente })
  }

  function handleConfirmarAnulacion() {
    if (!anulando) return
    cambiarEstado.mutate(
      { id: anulando.id, estado: "anulado" },
      { onSuccess: () => setAnulando(null) }
    )
  }

  return (
    <PaginaConEncabezado
      titulo="Remitos"
      descripcion={`Órdenes de entrega: ${ETIQUETA_ESTADO.nuevo} → ${ETIQUETA_ESTADO.preparando} → ${ETIQUETA_ESTADO.entregado}. El cobro se hace desde Finanzas.`}
      acciones={
        <Button size="sm" className="h-9" onClick={abrirAlta}>
          <Plus aria-hidden="true" />
          Nuevo remito
        </Button>
      }
    >
      {isLoading ? <FilaIndicadoresSkeleton /> : null}
      {resumen ? (
        <FilaIndicadores
          indicadores={resumen}
          etiquetaAccesible="Resumen de remitos"
        />
      ) : null}

      <BarraFiltros
        busqueda={busqueda}
        onBuscar={setBusqueda}
        placeholder="Buscar por cliente o número…"
        etiquetaBusqueda="Buscar remitos"
        contador={
          remitos
            ? `${filtrados.length} de ${remitos.length} remitos`
            : undefined
        }
      >
        <ChipsFiltro
          opciones={ESTADOS_REMITO}
          seleccionada={filtroEstado}
          onSeleccionar={setFiltroEstado}
          etiquetaGrupo="Filtrar por estado"
          etiquetaTodas="Todos"
          etiquetaOpcion={(estado) => ETIQUETA_ESTADO[estado]}
        />
      </BarraFiltros>

      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los remitos. Intentá recargar la página.
        </p>
      ) : (
        <Card className="overflow-hidden rounded-xl">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: FILAS_SKELETON }).map((_, indice) => (
                <Skeleton key={indice} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {remitos && filtrados.length > 0 ? (
            <TablaRemitos
              remitos={filtrados}
              onAvanzar={handleAvanzar}
              onEditar={abrirEdicion}
              onAnular={setAnulando}
            />
          ) : null}

          {remitos && filtrados.length === 0 ? (
            <EstadoVacio
              icono={FileText}
              titulo={
                remitos.length === 0
                  ? "Todavía no hay remitos"
                  : "Sin resultados con esos filtros"
              }
              descripcion={
                remitos.length === 0
                  ? "Creá el primero con el botón «Nuevo remito»."
                  : "Probá con otro cliente, número o estado."
              }
            />
          ) : null}
        </Card>
      )}

      <RemitoDialog
        abierto={dialogoAbierto}
        remito={remitoEnEdicion}
        onCerrar={() => setDialogoAbierto(false)}
      />

      {/* Confirmación de anulación (irreversible) */}
      <Dialog
        open={anulando !== null}
        onOpenChange={(abierto) => {
          if (!abierto && !cambiarEstado.isPending) setAnulando(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              ¿Anular el remito{" "}
              {anulando ? formatNumeroRemito(anulando.numero) : ""}?
            </DialogTitle>
            <DialogDescription>
              El remito de {anulando?.cliente?.razon_social ?? "este cliente"}{" "}
              quedará anulado y no se podrá cobrar ni volver a activar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAnulando(null)}
              disabled={cambiarEstado.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarAnulacion}
              disabled={cambiarEstado.isPending}
            >
              Anular remito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PaginaConEncabezado>
  )
}
