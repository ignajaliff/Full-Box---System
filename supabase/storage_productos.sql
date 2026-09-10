-- ---------------------------------------------------------------------------
-- Bucket `productos` — fotos de las cajas del catálogo.
--
-- PÚBLICO a propósito: estas imágenes se muestran en la landing pública, así
-- que la URL tiene que ser estable y no vencer. Es la excepción al resto del
-- sistema (tablas solo-admin): acá lo que se restringe es la ESCRITURA.
--
--   · leer   → cualquiera, por la URL pública (no lleva política)
--   · subir  → solo sesión con rol admin
--   · pisar  → solo sesión con rol admin
--   · borrar → solo sesión con rol admin
--
-- Un comando por política (nada de FOR ALL) y WITH CHECK en las de escritura,
-- según ai-pmp/security-rules.txt. Usa `tiene_rol('admin')`, la misma función
-- SECURITY DEFINER de las políticas de tablas.
--
-- Aplicado el 2026-09-10 con el MCP (migraciones `crear_bucket_productos` y
-- `politicas_storage_productos`). Se versiona acá para dejar registro.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "productos_insert_admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and public.tiene_rol('admin'));

create policy "productos_update_admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'productos' and public.tiene_rol('admin'))
  with check (bucket_id = 'productos' and public.tiene_rol('admin'));

create policy "productos_delete_admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and public.tiene_rol('admin'));
