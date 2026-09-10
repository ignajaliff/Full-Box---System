-- ---------------------------------------------------------------------------
-- handle_new_user — el alta de un usuario ya NO otorga privilegios.
--
-- ANTES: el trigger insertaba rol 'admin' para cualquier usuario nuevo. Con el
-- signup público abierto (disable_signup = false), cualquiera con la anon key
-- —que viaja en el bundle JS— podía registrarse y quedar como administrador.
--
-- AHORA: la fila se crea con rol 'pendiente'. Ese usuario pasa el login pero no
-- pasa el RLS (tiene_rol('admin') devuelve false), así que cae en la pantalla
-- "Sin autorización" y no ve ningún dato.
--
-- Para habilitar a alguien, el admin le cambia el rol a mano:
--   update public.user_roles set rol = 'admin' where id = '<uuid>';
--
-- Defensa en profundidad: NO reemplaza cerrar el signup público en
-- Authentication → Sign In / Providers. Lo complementa, para que un registro
-- no autorizado no derive en acceso total.
--
-- Aplicado el 2026-09-10 con el MCP (migración `endurecer_handle_new_user`).
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.user_roles (id, nombre, rol)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), new.email),
    'pendiente'
  );
  return new;
end;
$function$;
