import { useRef, useState } from "react"
import { ImagePlus, Loader2, Star, X } from "lucide-react"
import { useController, type Control } from "react-hook-form"

import {
  useSubirImagen,
  validarImagen,
} from "@/features/productos/hooks/useSubirImagen"
import type { ProductoInput } from "@/features/productos/schema"
import { MAX_FOTOS } from "@/features/productos/types"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"

type CampoImagenesProps = {
  control: Control<ProductoInput>
}

const CLASE_BOTON_MINI =
  "absolute top-1 rounded bg-background/90 p-1 text-foreground shadow-sm transition-colors hover:bg-background"

/**
 * Fotos del producto, hasta MAX_FOTOS. Se editan como UNA lista ordenada
 * (la primera es la principal: la que muestran la tabla y la landing), pero
 * se guardan en dos campos: `imagen_url` (principal) + `imagenes_extra`
 * (el resto, máx. 4). Así la landing sigue leyendo `imagen_url` sin cambios.
 *
 * Cada foto se sube al elegirla, no al guardar: el usuario ve el resultado en
 * el momento y no descubre un error recién al confirmar.
 */
export function CampoImagenes({ control }: CampoImagenesProps) {
  const extras = useController({ control, name: "imagenes_extra" })
  const subir = useSubirImagen()
  const inputRef = useRef<HTMLInputElement>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)

  return (
    <FormField
      control={control}
      name="imagen_url"
      render={({ field: principal }) => {
        // La lista que se ve: principal primero, sin huecos.
        const fotos = [principal.value, ...extras.field.value].filter(
          (url) => url !== ""
        )

        function guardarLista(lista: string[]) {
          principal.onChange(lista[0] ?? "")
          extras.field.onChange(lista.slice(1))
        }

        return (
          <FormItem>
            <FormLabel>Fotos del producto</FormLabel>

            <div className="grid grid-cols-5 gap-2">
              {fotos.map((url, indice) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-md border"
                >
                  <img
                    src={url}
                    alt={indice === 0 ? "Foto principal" : `Foto ${indice + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {indice === 0 ? (
                    <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm">
                      Principal
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`${CLASE_BOTON_MINI} left-1`}
                      title="Hacer principal"
                      aria-label={`Hacer principal la foto ${indice + 1}`}
                      onClick={() =>
                        guardarLista([
                          url,
                          ...fotos.filter((_, i) => i !== indice),
                        ])
                      }
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}

                  <button
                    type="button"
                    className={`${CLASE_BOTON_MINI} right-1`}
                    title="Quitar"
                    aria-label={`Quitar la foto ${indice + 1}`}
                    onClick={() => {
                      guardarLista(fotos.filter((_, i) => i !== indice))
                      setErrorArchivo(null)
                    }}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}

              {fotos.length < MAX_FOTOS ? (
                <button
                  type="button"
                  disabled={subir.isPending}
                  onClick={() => inputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-[11px] text-muted-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
                >
                  {subir.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  )}
                  {subir.isPending ? "Subiendo…" : "Agregar"}
                </button>
              ) : null}
            </div>

            {/* El input real queda oculto: la casilla «Agregar» es la que se ve. */}
            <FormControl>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(evento) => {
                  const archivo = evento.target.files?.[0]
                  // Permite volver a elegir el mismo archivo tras un error.
                  evento.target.value = ""
                  if (!archivo) return

                  const motivo = validarImagen(archivo)
                  setErrorArchivo(motivo)
                  if (motivo) return

                  subir.mutate(archivo, {
                    onSuccess: (url) => guardarLista([...fotos, url]),
                  })
                }}
              />
            </FormControl>

            <FormDescription>
              {errorArchivo ??
                `JPG, PNG o WebP, hasta 5 MB. Hasta ${MAX_FOTOS} fotos; la primera es la que se muestra en la web.`}
            </FormDescription>
            <FormMessage />
            {extras.fieldState.error?.message ? (
              <p className="text-[0.8rem] font-medium text-destructive">
                {extras.fieldState.error.message}
              </p>
            ) : null}
          </FormItem>
        )
      }}
    />
  )
}
