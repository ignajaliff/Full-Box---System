import { RemitoForm } from "@/features/remitos/components/RemitoForm"
import {
  useCrearRemito,
  useEditarRemito,
  type RemitoDetalle,
} from "@/features/remitos/hooks/useRemitos"
import type { RemitoInput } from "@/features/remitos/schema"
import { formatNumeroRemito } from "@/features/remitos/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type RemitoDialogProps = {
  abierto: boolean
  /** null = alta de un remito nuevo. */
  remito: RemitoDetalle | null
  onCerrar: () => void
}

/** Items del remito con la forma que espera el formulario. */
function aValoresIniciales(remito: RemitoDetalle): RemitoInput {
  return {
    cliente_id: remito.cliente_id,
    notas: remito.notas ?? "",
    items: remito.items.map((item) => ({
      producto_id: item.producto?.id ?? "",
      cantidad: item.cantidad,
    })),
  }
}

export function RemitoDialog({ abierto, remito, onCerrar }: RemitoDialogProps) {
  const crear = useCrearRemito()
  const editar = useEditarRemito()
  const guardando = crear.isPending || editar.isPending

  function handleGuardar(datos: RemitoInput) {
    if (remito) {
      editar.mutate({ id: remito.id, datos }, { onSuccess: onCerrar })
    } else {
      crear.mutate(datos, { onSuccess: onCerrar })
    }
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(estaAbierto) => {
        if (!estaAbierto && !guardando) onCerrar()
      }}
    >
      {/* Más ancho que el panel estándar: las filas de productos necesitan
          espacio para el buscador + cantidad + quitar. */}
      <DialogContent variante="panel" className="sm:max-w-2xl">
        <DialogHeader className="border-b border-hairline px-5 py-4">
          <DialogTitle>
            {remito
              ? `Editar remito ${formatNumeroRemito(remito.numero)}`
              : "Nuevo remito"}
          </DialogTitle>
          <DialogDescription>
            {remito
              ? "Cambiá el cliente, los productos o las notas. Los precios se siguen definiendo al cobrar."
              : "Elegí el cliente y los productos. El remito nace en estado «Nuevo» y se valoriza recién al cobrarlo."}
          </DialogDescription>
        </DialogHeader>

        <RemitoForm
          // Remonta el formulario al cambiar de remito (o pasar a alta).
          key={remito?.id ?? "nuevo"}
          valoresIniciales={remito ? aValoresIniciales(remito) : undefined}
          guardando={guardando}
          etiquetaGuardar={remito ? "Guardar cambios" : "Crear remito"}
          onGuardar={handleGuardar}
          onCancelar={onCerrar}
        />
      </DialogContent>
    </Dialog>
  )
}
