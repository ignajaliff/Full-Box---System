import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { useClientes } from "@/features/clientes/hooks/useClientes"
import { useProductos } from "@/features/productos/hooks/useProductos"
import { useCrearRemito } from "@/features/remitos/hooks/useRemitos"
import { remitoSchema, type RemitoInput } from "@/features/remitos/schema"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
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
import { Textarea } from "@/shared/components/ui/textarea"

type RemitoNuevoDialogProps = {
  abierto: boolean
  onCerrar: () => void
}

export function RemitoNuevoDialog({ abierto, onCerrar }: RemitoNuevoDialogProps) {
  const { data: clientes } = useClientes()
  const { data: productos } = useProductos()
  const crear = useCrearRemito()

  const form = useForm<RemitoInput>({
    resolver: zodResolver(remitoSchema),
    defaultValues: {
      cliente_id: "",
      notas: "",
      items: [{ producto_id: "", cantidad: 1 }],
    },
  })

  const items = useFieldArray({ control: form.control, name: "items" })
  const errorItems = form.formState.errors.items

  function handleGuardar(datos: RemitoInput) {
    crear.mutate(datos, {
      onSuccess: () => {
        form.reset()
        onCerrar()
      },
    })
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(estaAbierto) => {
        if (!estaAbierto && !crear.isPending) onCerrar()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuevo remito</DialogTitle>
          <DialogDescription>
            Elegí el cliente y los productos. El remito nace en estado «Nuevo»
            y se valoriza recién al cobrarlo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGuardar)} className="space-y-5">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <NativeSelect {...field}>
                      <option value="">Elegí un cliente…</option>
                      {clientes?.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.razon_social}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Productos</legend>

              {items.fields.map((fila, indice) => (
                <div key={fila.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${indice}.producto_id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <NativeSelect
                            aria-label={`Producto ${indice + 1}`}
                            {...field}
                          >
                            <option value="">Elegí un producto…</option>
                            {productos?.map((producto) => (
                              <option key={producto.id} value={producto.id}>
                                {producto.nombre} — {producto.medida}
                              </option>
                            ))}
                          </NativeSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${indice}.cantidad`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            step="1"
                            min="1"
                            aria-label={`Cantidad del producto ${indice + 1}`}
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const valor = event.target.valueAsNumber
                              field.onChange(Number.isNaN(valor) ? null : valor)
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 text-muted-foreground"
                    aria-label={`Quitar producto ${indice + 1}`}
                    disabled={items.fields.length === 1}
                    onClick={() => items.remove(indice)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ))}

              {errorItems?.root?.message || errorItems?.message ? (
                <p className="text-sm font-medium text-destructive">
                  {errorItems.root?.message ?? errorItems.message}
                </p>
              ) : null}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => items.append({ producto_id: "", cantidad: 1 })}
              >
                <Plus aria-hidden="true" />
                Agregar producto
              </Button>
            </fieldset>

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Observaciones para fábrica o para el envío"
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
                onClick={onCerrar}
                disabled={crear.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={crear.isPending}>
                {crear.isPending ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Creando…
                  </>
                ) : (
                  "Crear remito"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
