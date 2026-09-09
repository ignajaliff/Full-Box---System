-- ---------------------------------------------------------------------------
-- RPC editar_remito — reemplaza cliente, items y notas de un remito existente.
--
-- Mismo patrón que crear_remito: SECURITY INVOKER (respeta el RLS de quien la
-- llama), search_path fijo y EXECUTE revocado a public/anon.
--
-- Reglas que aplica (además de las que ya valida el trigger de estado):
--   * el remito tiene que existir y no estar anulado
--   * un remito ya cobrado NO se edita (los precios quedaron congelados)
--   * al menos un item, sin productos repetidos y con cantidades >= 1
--   * los items se reemplazan por completo (delete + insert dentro de la misma
--     transacción); precio_unitario vuelve a null porque se valoriza al cobrar
--
-- Aplicar con: supabase → SQL Editor, o el MCP (apply_migration).
-- ---------------------------------------------------------------------------

create or replace function public.editar_remito(
  p_remito_id uuid,
  p_cliente_id uuid,
  p_items jsonb,
  p_notas text default null
)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_estado    text;
  v_cobro_id  uuid;
  v_cantidad  int;
begin
  -- Bloquea la fila contra ediciones/cobros simultáneos.
  select estado, cobro_id
    into v_estado, v_cobro_id
    from remitos
   where id = p_remito_id
   for update;

  if not found then
    raise exception 'El remito no existe';
  end if;

  if v_cobro_id is not null then
    raise exception 'No se puede editar un remito ya cobrado';
  end if;

  if v_estado = 'anulado' then
    raise exception 'No se puede editar un remito anulado';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El remito necesita al menos un producto';
  end if;

  -- Productos repetidos: el UNIQUE(remito, producto) también lo atajaría,
  -- pero con este chequeo el mensaje es claro.
  select count(distinct item->>'producto_id')
    into v_cantidad
    from jsonb_array_elements(p_items) as item;

  if v_cantidad <> jsonb_array_length(p_items) then
    raise exception 'Hay productos repetidos en el remito';
  end if;

  if exists (
    select 1
      from jsonb_array_elements(p_items) as item
     where coalesce((item->>'cantidad')::int, 0) < 1
  ) then
    raise exception 'Las cantidades tienen que ser 1 o más';
  end if;

  update remitos
     set cliente_id = p_cliente_id,
         notas      = p_notas
   where id = p_remito_id;

  -- Reemplazo completo de los items (sin precios: se valoriza al cobrar).
  delete from items_remito where remito_id = p_remito_id;

  insert into items_remito (remito_id, producto_id, cantidad)
  select p_remito_id,
         (item->>'producto_id')::uuid,
         (item->>'cantidad')::int
    from jsonb_array_elements(p_items) as item;
end;
$$;

revoke execute on function public.editar_remito(uuid, uuid, jsonb, text)
  from public, anon;

grant execute on function public.editar_remito(uuid, uuid, jsonb, text)
  to authenticated;
