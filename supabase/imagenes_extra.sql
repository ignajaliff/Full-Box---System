-- ---------------------------------------------------------------------------
-- Fotos adicionales del producto — hasta 5 fotos en total.
--
-- `imagen_url` sigue siendo la foto PRINCIPAL (la que muestran la tabla del
-- sistema y las tarjetas/ficha de la landing). `imagenes_extra` guarda hasta
-- 4 URLs más, en orden. Se eligió un text[] y no cuatro columnas sueltas:
-- un solo campo para validar (tope, sin nulos ni vacíos), recorrer y guardar.
--
-- Todas apuntan al bucket público `productos` (ver storage_productos.sql);
-- el sistema borra los archivos al eliminar el producto.
--
-- Aplicado el 2026-09-14 con el MCP (migración `imagenes_extra_productos`).
-- ---------------------------------------------------------------------------

alter table public.productos
  add column imagenes_extra text[] not null default '{}'::text[];

comment on column public.productos.imagenes_extra is
  'Hasta 4 URLs públicas del bucket productos, además de imagen_url (la principal). Sin nulos ni vacíos.';

alter table public.productos
  add constraint productos_imagenes_extra_check
  check (
    cardinality(imagenes_extra) <= 4
    and array_position(imagenes_extra, null) is null
    and not ('' = any(imagenes_extra))
  );
