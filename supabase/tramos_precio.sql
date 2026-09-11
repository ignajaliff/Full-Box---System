-- ---------------------------------------------------------------------------
-- Tramos de precio por cantidad — reemplazan a desc_x100 / desc_x250 / desc_x500.
--
-- ANTES: tres descuentos porcentuales fijos en 100, 250 y 500 unidades. No
-- servían para casos reales como «mínimo 20 y un solo tramo en 60».
--
-- AHORA: `productos.tramos_precio` (jsonb) guarda hasta 4 tramos
-- {cantidad, precio}: desde `cantidad` unidades, cada una vale `precio`.
-- La función `tramos_precio_validos` lo valida en un CHECK: array de hasta
-- 4 objetos, cantidad entera > unidad_minima, creciente y sin repetir,
-- precio >= 0.
--
-- Los descuentos que había se migraron a tramos con el precio resultante.
--
-- Aplicado el 2026-09-11 con el MCP (migración `tramos_precio_productos`).
--
-- PASO 2 — PENDIENTE hasta que la landing lea `tramos_precio` (hoy lee las
-- columnas viejas en src/features/productos/types.ts → getTramos). Mientras
-- tanto siguen existiendo con default 0. Cuando la landing esté migrada:
--
--   alter table public.productos
--     drop column desc_x100,
--     drop column desc_x250,
--     drop column desc_x500;
--
-- (y regenerar los tipos en los dos proyectos).
-- ---------------------------------------------------------------------------

create or replace function public.tramos_precio_validos(tramos jsonb, unidad_minima integer)
returns boolean
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  tramo jsonb;
  cantidad numeric;
  anterior numeric := null;
begin
  if tramos is null or jsonb_typeof(tramos) is distinct from 'array' then
    return false;
  end if;
  if jsonb_array_length(tramos) > 4 then
    return false;
  end if;

  for tramo in select value from jsonb_array_elements(tramos) loop
    if jsonb_typeof(tramo) is distinct from 'object'
       or jsonb_typeof(tramo->'cantidad') is distinct from 'number'
       or jsonb_typeof(tramo->'precio') is distinct from 'number' then
      return false;
    end if;

    cantidad := (tramo->>'cantidad')::numeric;
    -- Entera, por encima de la unidad mínima y en orden creciente sin repetir.
    if cantidad <> trunc(cantidad) or cantidad <= unidad_minima then
      return false;
    end if;
    if anterior is not null and cantidad <= anterior then
      return false;
    end if;
    if (tramo->>'precio')::numeric < 0 then
      return false;
    end if;
    anterior := cantidad;
  end loop;

  return true;
end;
$$;

revoke all on function public.tramos_precio_validos(jsonb, integer) from public, anon;
grant execute on function public.tramos_precio_validos(jsonb, integer) to authenticated;

alter table public.productos
  add column tramos_precio jsonb not null default '[]'::jsonb;

comment on column public.productos.tramos_precio is
  'Hasta 4 tramos {cantidad, precio}: desde esa cantidad, precio unitario. Orden creciente, cantidad > unidad_minima.';

-- Migra los descuentos fijos existentes: cada % > 0 pasa a ser un tramo con
-- el precio unitario resultante (redondeado a 2 decimales).
update public.productos p
set tramos_precio = coalesce((
  select jsonb_agg(
           jsonb_build_object(
             'cantidad', t.cantidad,
             'precio',   round(p.precio * (100 - t.descuento) / 100, 2)
           )
           order by t.cantidad
         )
    from (values (100, p.desc_x100), (250, p.desc_x250), (500, p.desc_x500))
           as t(cantidad, descuento)
   where t.descuento > 0
     and t.cantidad > p.unidad_minima
), '[]'::jsonb)
where p.precio is not null;

alter table public.productos
  add constraint productos_tramos_precio_check
  check (public.tramos_precio_validos(tramos_precio, unidad_minima));

-- Transición: las columnas viejas siguen existiendo porque la landing todavía
-- las lee. Sus defaults pasan a 0 para que un producto nuevo no muestre en la
-- web descuentos que nadie cargó. Se borran cuando la landing lea tramos_precio.
alter table public.productos
  alter column desc_x100 set default 0,
  alter column desc_x250 set default 0,
  alter column desc_x500 set default 0;
