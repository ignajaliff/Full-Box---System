import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { useClientes } from "@/features/clientes/hooks/useClientes"
import { useProductos } from "@/features/productos/hooks/useProductos"
import { remitoSchema, type RemitoInput } from "@/features/remitos/schema"
import { Button } from "@/shared/components/ui/button"
import { Combobox, type OpcionCombobox } from "@/shared/components/ui/combobox"
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
import { Textarea } from "@/shared/components/ui/textarea"

const VALORES_VACIOS: RemitoInput = {
  cliente_id: "",
  notas: "",
  items: [{ producto_id: "", cantidad: 1 }],
}

/** Rótulo de sección del formulario, en el mismo tono que el resto del CRM. */
const CLASE_SECCION = "text-[11.5px] font-semibold text-muted-foreground"

type RemitoFormProps = {
  /** Valores iniciales; sin esto arranca vacío (alta). */
  valoresIniciales?: RemitoInput
  guardando: boolean
  etiquetaGuardar: string
  onGuardar: (datos: RemitoInput) => void
  onCancelar: () => void
}

export function RemitoForm({
  valoresIniciales,
  guardando,
  etiquetaGuardar,
  onGuardar,
  onCancelar,
}: RemitoFormProps) {
  const { data: clientes } = useClientes()
  const { data: productos } = useProductos()

  const form = useForm<RemitoInput>({
    resolver: zodResolver(remitoSchema),
    defaultValues: valoresIniciales ?? VALORES_VACIOS,
  })

  const items = useFieldArray({ control: form.control, name: "items" })
  const errorItems = form.formState.errors.items

  const opcionesClientes = useMemo<OpcionCombobox[]>(
    () =>
      (clientes ?? []).map((cliente) => ({
        valor: cliente.id,
        etiqueta: cliente.razon_social,
        detalle: cliente.cuit ?? undefined,
      })),
    [clientes]
  )

  const opcionesProductos = useMemo<OpcionCombobox[]>(
    () =>
      (productos ?? []).map((producto) => ({
        valor: producto.id,
        etiqueta: producto.nombre,
        detalle: producto.medida,
      })),
    [productos]
  )

  return (
    <Form {...form}>
      {/* Columna del panel lateral: los campos scrollean, el pie queda fijo. */}
      <form
        onSubmit={form.handleSubmit(onGuardar)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={CLASE_SECCION}>Cliente</FormLabel>
                <FormControl>
                  <Combobox
                    opciones={opcionesClientes}
                    valor={field.value}
                    onSeleccionar={field.onChange}
                    placeholder="Elegí un cliente…"
                    placeholderBusqueda="Buscar por nombre o CUIT…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <fieldset className="space-y-2.5">
            <div className="flex items-baseline justify-between">
              <legend className={CLASE_SECCION}>Productos</legend>
              <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
                {items.fields.length} producto
                {items.fields.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Bloque agrupado: las filas comparten un mismo contenedor. */}
            <div className="space-y-2.5 rounded-lg border border-hairline bg-muted/20 p-3">
              {items.fields.map((fila, indice) => (
                <div key={fila.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${indice}.producto_id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Combobox
                            opciones={opcionesProductos}
                            valor={field.value}
                            onSeleccionar={field.onChange}
                            placeholder="Elegí un producto…"
                            placeholderBusqueda="Buscar por nombre o medida…"
                            aria-label={`Producto ${indice + 1}`}
                            className="bg-background"
                          />
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
                            className="bg-background font-mono tabular-nums"
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
                    className="mt-0.5 shrink-0 text-muted-foreground"
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
                className="bg-background"
                onClick={() => items.append({ producto_id: "", cantidad: 1 })}
              >
                <Plus aria-hidden="true" />
                Agregar producto
              </Button>
            </div>
          </fieldset>

          <FormField
            control={form.control}
            name="notas"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={CLASE_SECCION}>
                  Notas (opcional)
                </FormLabel>
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
        </div>

        <DialogFooter className="border-t border-hairline p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={guardando}
            className="sm:flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando} className="sm:flex-1">
            {guardando ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              etiquetaGuardar
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
