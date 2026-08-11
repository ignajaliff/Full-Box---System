import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { clienteSchema, type ClienteInput } from "@/features/clientes/schema"
import { CONDICIONES_IVA, type Cliente } from "@/features/clientes/types"
import { Button } from "@/shared/components/ui/button"
import { DialogFooter } from "@/shared/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { NativeSelect } from "@/shared/components/ui/native-select"

type ClienteFormProps = {
  /** null = alta de un cliente nuevo. */
  cliente: Cliente | null
  guardando: boolean
  onGuardar: (datos: ClienteInput) => void
  onCancelar: () => void
}

export function ClienteForm({
  cliente,
  guardando,
  onGuardar,
  onCancelar,
}: ClienteFormProps) {
  const form = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      razon_social: cliente?.razon_social ?? "",
      cuit: cliente?.cuit ?? "",
      condicion_iva: cliente?.condicion_iva ?? "",
      telefono: cliente?.telefono ?? "",
      email: cliente?.email ?? "",
      direccion_entrega: cliente?.direccion_entrega ?? "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGuardar)} className="space-y-4">
        <FormField
          control={form.control}
          name="razon_social"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre / razón social</FormLabel>
              <FormControl>
                <Input autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cuit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUIT / CUIL</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder="30-12345678-9"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condicion_iva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condición de IVA</FormLabel>
                <FormControl>
                  <NativeSelect {...field}>
                    <option value="">Sin especificar</option>
                    {CONDICIONES_IVA.map((condicion) => (
                      <option key={condicion} value={condicion}>
                        {condicion}
                      </option>
                    ))}
                  </NativeSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    autoComplete="off"
                    placeholder="Ej. 351 555 0000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="off"
                    placeholder="cliente@empresa.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion_entrega"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección de entrega</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="Calle, número, ciudad"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : cliente ? (
              "Guardar cambios"
            ) : (
              "Crear cliente"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
