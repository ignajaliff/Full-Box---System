import { useMutation } from "@tanstack/react-query"

import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/shared/hooks/use-toast"

/** Bucket público de fotos de producto (ver supabase/storage_productos.sql). */
const BUCKET = "productos"

export const BUCKET_PRODUCTOS = BUCKET

/** Marca que separa el bucket del nombre del archivo en la URL pública. */
const MARCA_PUBLICA = `/storage/v1/object/public/${BUCKET}/`

/**
 * Nombre del archivo dentro del bucket a partir de su URL pública, o null si
 * la URL apunta a otro lado (una imagen externa pegada a mano en su momento):
 * esas no son nuestras y no hay que borrarlas.
 */
export function rutaEnBucket(url: string | null) {
  if (!url) return null
  const indice = url.indexOf(MARCA_PUBLICA)
  if (indice === -1) return null
  return url.slice(indice + MARCA_PUBLICA.length) || null
}

/** Los mismos límites que valida el bucket, para avisar antes de subir. */
export const TAMANO_MAXIMO = 5 * 1024 * 1024
export const FORMATOS = ["image/jpeg", "image/png", "image/webp"]

/** Motivo por el que un archivo no sirve, o null si está bien. */
export function validarImagen(archivo: File) {
  if (!FORMATOS.includes(archivo.type)) {
    return "Formato no admitido. Subí un JPG, PNG o WebP."
  }
  if (archivo.size > TAMANO_MAXIMO) {
    return "La imagen supera los 5 MB. Probá con una más liviana."
  }
  return null
}

/** Extensión a partir del tipo real del archivo (no del nombre, que miente). */
function extension(tipo: string) {
  if (tipo === "image/png") return "png"
  if (tipo === "image/webp") return "webp"
  return "jpg"
}

/**
 * Sube la foto al bucket y devuelve su URL pública, que es lo que se guarda
 * en `productos.imagen_url`.
 *
 * El nombre lo genera el cliente con `crypto.randomUUID()`: así dos productos
 * nunca se pisan el archivo y el nombre original (que puede traer acentos o
 * espacios) no llega al bucket.
 */
export function useSubirImagen() {
  return useMutation({
    mutationFn: async (archivo: File) => {
      const ruta = `${crypto.randomUUID()}.${extension(archivo.type)}`

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(ruta, archivo, { contentType: archivo.type })

      if (error) throw error

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta)
      return data.publicUrl
    },
    onError: (error) => {
      toast({
        title: "No se pudo subir la imagen",
        description: "Revisá tu conexión e intentá de nuevo.",
        variant: "destructive",
      })
      if (import.meta.env.DEV) console.error(error)
    },
  })
}
