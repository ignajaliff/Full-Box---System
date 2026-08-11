import { useMemo, useState } from "react"
import { FileText, Plus, Search } from "lucide-react"

import { RemitoNuevoDialog } from "@/features/remitos/components/RemitoNuevoDialog"
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
} from "@/features/remitos/types"
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
import { NativeSelect } from "@/shared/components/ui/native-select"
import { Skeleton } from "@/shared/components/ui/skeleton"

const FILAS_SKELETON = 5

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").trim()
}

export default function RemitosPage() {
  const { data: remitos, isLoading, isError } = useRemitos()
  const cambiarEstado = useCambiarEstadoRemito()
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [dialogoNuevo, setDialogoNuevo] = useState(false)
  const [anulando, setAnulando] = useState<RemitoDetalle | null>(null)

  const filtrados = useMemo(() => {
    if (!remitos) return []
    const termino = normalizar(busqueda)

    return remitos.filter((remito) => {
      if (filtroEstado && remito.estado !== filtroEstado) return false
      if (!termino) return true
      return (
        normalizar(remito.cliente?.razon_social ?? "").includes(termino) ||
        normalizar(formatNumeroRemito(remito.numero)).includes(termino) ||
        remito.numero.toString().includes(termino)
      )
    })
  }, [remitos, busqueda, filtroEstado])

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
    <div className="space-y-6 p-6 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Remitos</h1>
          <p className="text-sm text-muted-foreground">
            Órdenes de entrega de la fábrica: {ETIQUETA_ESTADO.nuevo} →{" "}
            {ETIQUETA_ESTADO.preparando} → {ETIQUETA_ESTADO.entregado}. El cobro
            se hace desde Finanzas.
          </p>
        </div>
        <Button onClick={() => setDialogoNuevo(true)}>
          <Plus aria-hidden="true" />
          Nuevo remito
        </Button>
      </header>

      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los remitos. Intentá recargar la página.
        </p>
      ) : (
        <Card className="overflow-hidden rounded-xl">
          <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por cliente o número…"
              aria-label="Buscar remitos"
              className="h-8 min-w-40 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <NativeSelect
              value={filtroEstado}
              onChange={(event) => setFiltroEstado(event.target.value)}
              aria-label="Filtrar por estado"
              className="h-8 w-40 py-0"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_REMITO.map((estado) => (
                <option key={estado} value={estado}>
                  {ETIQUETA_ESTADO[estado]}
                </option>
              ))}
            </NativeSelect>
            {remitos ? (
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {filtrados.length} de {remitos.length}
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

          {remitos && filtrados.length > 0 ? (
            <TablaRemitos
              remitos={filtrados}
              onAvanzar={handleAvanzar}
              onAnular={setAnulando}
            />
          ) : null}

          {remitos && filtrados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
              <FileText
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">
                {remitos.length === 0
                  ? "Todavía no hay remitos"
                  : "Sin resultados con esos filtros"}
              </p>
              <p className="text-sm text-muted-foreground">
                {remitos.length === 0
                  ? "Creá el primero con el botón «Nuevo remito»."
                  : "Probá con otro cliente, número o estado."}
              </p>
            </div>
          ) : null}
        </Card>
      )}

      <RemitoNuevoDialog
        abierto={dialogoNuevo}
        onCerrar={() => setDialogoNuevo(false)}
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
    </div>
  )
}
