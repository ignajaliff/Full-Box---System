# ---------- Etapa 1: build ----------
FROM node:22-alpine AS build

WORKDIR /app

# Se copian primero los manifiestos para aprovechar la cache de capas:
# si no cambian las dependencias, Docker reutiliza el npm ci.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite reemplaza las VITE_* en tiempo de BUILD, pero CapRover inyecta sus
# variables en tiempo de EJECUCIÓN. Por eso se compila con marcadores y el
# entrypoint los reemplaza al arrancar el contenedor (ver docker-entrypoint.sh).
# Así las credenciales no viven en la imagen y se pueden rotar sin recompilar.
ENV VITE_SUPABASE_URL=__VITE_SUPABASE_URL__
ENV VITE_SUPABASE_ANON_KEY=__VITE_SUPABASE_ANON_KEY__

RUN npm run build


# ---------- Etapa 2: servidor ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

COPY docker-entrypoint.sh /docker-entrypoint.d/99-full-box-env.sh
# Normaliza saltos de línea (el repo se edita en Windows: un CRLF rompe el
# script dentro del contenedor Linux) y lo deja ejecutable.
RUN sed -i 's/\r$//' /docker-entrypoint.d/99-full-box-env.sh \
  && chmod +x /docker-entrypoint.d/99-full-box-env.sh

# CapRover rutea al puerto 80 del contenedor por defecto.
EXPOSE 80
