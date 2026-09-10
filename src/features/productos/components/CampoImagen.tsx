import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"

import {
  useSubirImagen,
  validarImagen,
} from "@/features/productos/hooks/useSubirImagen"
import type { ProductoInput } from "@/features/productos/schema"
import { Button } from "@/shared/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"

type CampoImagenProps = {
  control: Control<ProductoInput>
}

/**
 * Foto del producto: se elige un archivo, se sube al bucket `productos` y en
 * el formulario queda su URL pública (que es lo que guarda `imagen_url`).
 *
 * La subida ocurre al elegir el archivo, no al guardar: así el usuario ve el
 * resultado en el momento y no descubre un error recién al confirmar.
 */
export function CampoImagen({ control }: CampoImagenProps) {
  const subir = useSubirImagen()
  const inputRef = useRef<HTMLInputElement>(null)
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)

  return (
    <FormField
      control={control}
      name="imagen_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Foto del producto</FormLabel>

          {field.value ? (
            <div className="flex items-center gap-3">
              <img
                src={field.value}
                alt="Foto del producto"
                className="h-20 w-20 rounded-md border object-cover"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  field.onChange("")
                  setErrorArchivo(null)
                }}
              >
                <Trash2 aria-hidden="true" />
                Quitar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={subir.isPending}
              onClick={() => inputRef.current?.click()}
            >
              {subir.isPending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Subiendo…
                </>
              ) : (
                <>
                  <ImagePlus aria-hidden="true" />
                  Agregar foto
                </>
              )}
            </Button>
          )}

          {/* El input real queda oculto: el botón de arriba es el que se ve. */}
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
                  onSuccess: (url) => field.onChange(url),
                })
              }}
            />
          </FormControl>

          <FormDescription>
            {errorArchivo ?? "JPG, PNG o WebP. Hasta 5 MB."}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
