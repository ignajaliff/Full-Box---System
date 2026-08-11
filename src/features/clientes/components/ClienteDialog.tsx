import { ClienteForm } from "@/features/clientes/components/ClienteForm"
import {
  useActualizarCliente,
  useCrearCliente,
} from "@/features/clientes/hooks/useClientes"
import type { ClienteInput } from "@/features/clientes/schema"
import type { Cliente } from "@/features/clientes/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type ClienteDialogProps = {
  abierto: boolean
  /** null = alta de un cliente nuevo. */
  cliente: Cliente | null
  onCerrar: () => void
}

export function ClienteDialog({ abierto, cliente, onCerrar }: ClienteDialogProps) {
  const crear = useCrearCliente()
  const actualizar = useActualizarCliente()
  const guardando = crear.isPending || actualizar.isPending

  function handleGuardar(datos: ClienteInput) {
    if (cliente) {
      actualizar.mutate({ id: cliente.id, datos }, { onSuccess: onCerrar })
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {cliente ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
          <DialogDescription>
            {cliente
              ? "Modificá los datos del cliente y guardá los cambios."
              : "Cargá los datos del cliente. Solo el nombre es obligatorio."}
          </DialogDescription>
        </DialogHeader>

        <ClienteForm
          // Remonta el formulario al cambiar de cliente (o pasar a alta).
          key={cliente?.id ?? "nuevo"}
          cliente={cliente}
          guardando={guardando}
          onGuardar={handleGuardar}
          onCancelar={onCerrar}
        />
      </DialogContent>
    </Dialog>
  )
}
