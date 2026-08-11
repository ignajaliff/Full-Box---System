import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { useCobrarRemitos, type RemitoPendiente } from "@/features/finanzas/hooks/useFinanzas"
import { cobroSchema, type CobroInput } from "@/features/finanzas/schema"
import { METODOS_COBRO } from "@/features/finanzas/types"
import { formatNumeroRemito } from "@/features/remitos/types"
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
import { formatCurrency } from "@/shared/utils/formatCurrency"

type CobroDialogProps = {
  /** Remitos a cobrar (entregados, sin cobro y del mismo cliente). */
  remitos: RemitoPendiente[]
  onCerrar: () => void
}

export function CobroDialog({ remitos, onCerrar }: CobroDialogProps) {
  const cobrar = useCobrarRemitos()

  // Todos los items de los remitos seleccionados, aplanados y en orden.
  const itemsPlanos = remitos.flatMap((remito) =>
    remito.items.map((item) => ({ remito, item }))
  )

  const form = useForm<CobroInput>({
    resolver: zodResolver(cobroSchema),
    defaultValues: {
      metodo: "efectivo",
      nro_factura: "",
      notas: "",
      // Sugiere el precio de catálogo vigente; editable antes de confirmar.
      precios: itemsPlanos.map(({ item }) => ({
        item_id: item.id,
        precio: item.producto?.precio ?? null,
      })),
    },
  })

  const precios = form.watch("precios")
  const metodo = form.watch("metodo")

  const total = itemsPlanos.reduce((suma, { item }, indice) => {
    const precio = precios[indice]?.precio
    return precio !== null && precio !== undefined
      ? suma + item.cantidad * precio
      : suma
  }, 0)

  function handleConfirmar(datos: CobroInput) {
    const mapaPrecios: Record<string, number> = {}
    for (const fila of datos.precios) {
      if (fila.precio !== null) mapaPrecios[fila.item_id] = fila.precio
    }

    cobrar.mutate(
      {
        remitoIds: remitos.map((remito) => remito.id),
        metodo: datos.metodo,
        precios: mapaPrecios,
        nroFactura:
          datos.metodo === "facturado" && datos.nro_factura.trim() !== ""
            ? datos.nro_factura.trim()
            : undefined,
        notas: datos.notas.trim() !== "" ? datos.notas.trim() : undefined,
      },
      { onSuccess: onCerrar }
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(abierto) => {
        if (!abierto && !cobrar.isPending) onCerrar()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Cobrar a {remitos[0]?.cliente?.razon_social ?? "cliente"}
          </DialogTitle>
          <DialogDescription>
            Revisá los precios de cada item — quedan congelados al confirmar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleConfirmar)} className="space-y-5">
            <div className="space-y-4">
              {remitos.map((remito) => (
                <section key={remito.id} className="space-y-2">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {formatNumeroRemito(remito.numero)}
                  </h3>
                  {remito.items.map((item) => {
                    const indice = itemsPlanos.findIndex(
                      (fila) => fila.item.id === item.id
                    )
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <p className="flex-1 text-sm">
                          {item.producto?.nombre ?? "Producto"}
                          <span className="text-muted-foreground">
                            {" "}
                            × {item.cantidad}
                          </span>
                        </p>
                        <FormField
                          control={form.control}
                          name={`precios.${indice}.precio`}
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormControl>
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.01"
                                  min="0"
                                  aria-label={`Precio unitario de ${item.producto?.nombre ?? "producto"}`}
                                  value={field.value ?? ""}
                                  onChange={(event) => {
                                    const valor = event.target.valueAsNumber
                                    field.onChange(
                                      Number.isNaN(valor) ? null : valor
                                    )
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
                      </div>
                    )
                  })}
                </section>
              ))}
            </div>

            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="metodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de cobro</FormLabel>
                    <FormControl>
                      <NativeSelect {...field}>
                        {METODOS_COBRO.map((opcion) => (
                          <option key={opcion.valor} value={opcion.valor}>
                            {opcion.etiqueta}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {metodo === "facturado" ? (
                <FormField
                  control={form.control}
                  name="nro_factura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>N° de factura (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="off"
                          placeholder="FC-A-0001-00001234"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="items-center gap-3 border-t pt-4 sm:justify-between">
              <p className="text-sm">
                Total:{" "}
                <span className="text-lg font-semibold tabular-nums">
                  {formatCurrency(total)}
                </span>
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCerrar}
                  disabled={cobrar.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={cobrar.isPending}>
                  {cobrar.isPending ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      Registrando…
                    </>
                  ) : (
                    "Confirmar cobro"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
