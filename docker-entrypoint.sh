#!/bin/sh
# Inyecta las credenciales de Supabase en el bundle ya compilado.
#
# Por qué existe: Vite reemplaza las VITE_* al compilar, pero CapRover define
# sus variables recién al arrancar el contenedor. La imagen se construye con
# marcadores (__VITE_SUPABASE_URL__) y acá se cambian por los valores reales.
# Resultado: la misma imagen sirve para cualquier entorno y las credenciales
# no quedan grabadas dentro de ella.
#
# La imagen oficial de nginx ejecuta sola todo /docker-entrypoint.d/*.sh
# antes de levantar el servidor.
set -eu

# Overridable solo para poder probar el script fuera del contenedor.
RAIZ_WEB="${RAIZ_WEB:-/usr/share/nginx/html}"

faltante=""
[ -z "${VITE_SUPABASE_URL:-}" ] && faltante="VITE_SUPABASE_URL"
[ -z "${VITE_SUPABASE_ANON_KEY:-}" ] && faltante="$faltante VITE_SUPABASE_ANON_KEY"

if [ -n "$faltante" ]; then
  echo "ERROR: faltan variables de entorno:$faltante" >&2
  echo "Cargalas en CapRover → App Configs → Environmental Variables y redesplegá." >&2
  exit 1
fi

echo "Full Box: inyectando configuración de Supabase en el bundle…"

find "$RAIZ_WEB" -type f \( -name '*.js' -o -name '*.html' \) -exec sed -i \
  -e "s|__VITE_SUPABASE_URL__|${VITE_SUPABASE_URL}|g" \
  -e "s|__VITE_SUPABASE_ANON_KEY__|${VITE_SUPABASE_ANON_KEY}|g" \
  {} +

# Si quedó algún marcador sin reemplazar, la app fallaría en el navegador con
# un error confuso. Mejor no arrancar y decirlo acá.
if grep -rql '__VITE_SUPABASE_' "$RAIZ_WEB" 2>/dev/null; then
  echo "ERROR: quedaron marcadores sin reemplazar en el bundle." >&2
  exit 1
fi

echo "Full Box: configuración lista."
