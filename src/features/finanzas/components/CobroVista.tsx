import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  useCobrarRemitos,
  type RemitoPendiente,
} from "@/features/finanzas/hooks/useFinanzas"
import { TarjetaRemitoCobro } from "@/features/finanzas/components/TarjetaRemitoCobro"
import { cobroSchema, type CobroInput } from "@/features/finanzas/schema"
import { METODOS_COBRO } from "@/features/finanzas/types"
import { PaginaConEncabezado } from "@/shared/components/layout/PaginaConEncabezado"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
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

type CobroVistaProps = {
  /** Remitos a cobrar (entregados, sin cobro y del mismo cliente). */
  remitos: RemitoPendiente[]
  /** Se salió sin cobrar: vuelve a la lista de pendientes. */
  onCancelar: () => void
  /** El cobro se registró: los remitos ya no están pendientes. */
  onConfirmado: () => void
}

/**
 * Confirmación del cobro como VISTA DE LA PÁGINA (no modal ni overlay): el cobro
 * congela precios y es irreversible, así que merece toda el área de contenido
 * para ver el detalle antes de confirmar. El navegador lateral queda visible.
 *
 * No es una ruta propia: el flujo nace de una selección en Finanzas y no tiene
 * sentido entrar por URL.
 */
export function CobroVista({
  remitos,
  onCancelar,
  onConfirmado,
}: CobroVistaProps) {
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

  /** Los indices de `precios` son globales: mapea item_id -> posicion. */
  const indiceDe = (itemId: string) =>
    itemsPlanos.findIndex((fila) => fila.item.id === itemId)

  const precios = form.watch("precios")
  const metodo = form.watch("metodo")

  const total = itemsPlanos.reduce((suma, { item }, indice) => {
    const precio = precios[indice]?.precio
    return precio !== null && precio !== undefined
      ? suma + item.cantidad * precio
      : suma
  }, 0)

  const cantidadItems = itemsPlanos.length

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
      { onSuccess: onConfirmado }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleConfirmar)}>
        <PaginaConEncabezado
          titulo={`Cobrar a ${remitos[0]?.cliente?.razon_social ?? "cliente"}`}
          descripcion={`${remitos.length} remito${remitos.length === 1 ? "" : "s"} · ${cantidadItems} item${cantidadItems === 1 ? "" : "s"} · los precios quedan congelados al confirmar`}
          acciones={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelar}
              disabled={cobrar.isPending}
            >
              <ArrowLeft aria-hidden="true" />
              Volver
            </Button>
          }
        >
          {remitos.map((remito) => (
            <TarjetaRemitoCobro
              key={remito.id}
              remito={remito}
              control={form.control}
              precios={precios}
              indiceDe={indiceDe}
            />
          ))}

          <Card className="rounded-xl">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
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

              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Notas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Cierre del flujo: total y confirmación al pie del contenido. */}
          <Card className="rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                Total a cobrar:{" "}
                <span className="font-mono text-[22px] font-semibold tabular-nums text-foreground">
                  {formatCurrency(total)}
                </span>
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancelar}
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
            </div>
          </Card>
        </PaginaConEncabezado>
      </form>
    </Form>
  )
}
