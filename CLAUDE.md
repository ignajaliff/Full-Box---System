# CLAUDE.md — Hoja de ruta del proyecto

> Este archivo es leído automáticamente por Claude al iniciar cualquier conversación en este proyecto.
> Contiene el contexto del sistema, las decisiones tomadas y el estado actual del desarrollo.
> **Mantenerlo actualizado es obligatorio** — es la memoria del proyecto entre sesiones.

---

## Proyecto

**Nombre**: Full Box
**Tipo**: Sistema de gestión a medida
**Cliente**: Full Box (fábrica de cajas)
**Desarrollado por**: Nuvvora
**Inicio**: 2026-07-23

### Descripción del sistema

Sistema de gestión integral para una fábrica de cajas. Administra ventas, clientes, encargos y la
producción de fábrica en un solo lugar. Incluye además un módulo "Web" que controla y almacena el
contenido que se muestra en una landing page pública, conectada al sistema vía Supabase.

---

## Reglas del proyecto

Este proyecto respeta estrictamente los siguientes documentos. Leerlos antes de hacer cualquier cambio:

* [ai-pmp/rules.txt](ai-pmp/rules.txt) — Stack, arquitectura general y reglas de código
* [ai-pmp/frontend-rules.txt](ai-pmp/frontend-rules.txt) — Componentes, formularios, estado y UI
* [ai-pmp/supabase-rules.txt](ai-pmp/supabase-rules.txt) — Base de datos, RLS, seguridad y queries
* [ai-pmp/security-rules.txt](ai-pmp/security-rules.txt) — Signup, trampas de RLS, storage, hardening y auditoría
* [ai-pmp/error-handling.txt](ai-pmp/error-handling.txt) — Manejo de errores y estados de carga
* [ai-pmp/naming-rules.txt](ai-pmp/naming-rules.txt) — Convenciones de nombres
* [ai-pmp/git-rules.txt](ai-pmp/git-rules.txt) — Commits y ramas

> La carpeta `KNOW - HOW/` es el kit original del que se copió `ai-pmp/`. No editar código a partir de ella.

---

## Stack del proyecto

* React 18.3 + Vite 6 + TypeScript strict
* Tailwind CSS 3.4 (postcss.config.js) + shadcn/ui — componentes agregados a mano en `shared/components/ui/`
* Supabase (auth + base de datos) — **conectado**. Proyecto `full_box`
  (ref `bwjppaihfaxcertrzsbr`, región sa-east-1)
* TanStack React Query 5
* React Hook Form + Zod
* React Router v6

---

## Comandos

```
npm run dev          → servidor de desarrollo (puerto 8080)
npm run build        → build de producción (debe pasar sin errores antes de entregar)
npx tsc --noEmit     → verificación de tipos (correr antes de entregar cualquier cambio)
```

---

## Deploy (CapRover)

Archivos en la raíz: `captain-definition`, `Dockerfile`, `nginx.conf`,
`docker-entrypoint.sh`, `.dockerignore`, `.gitattributes`.

Imagen en dos etapas: `node:22-alpine` compila y `nginx:1.27-alpine` sirve el `dist`
en el puerto 80 (el que espera CapRover).

**Variables a cargar en CapRover** → App Configs → Environmental Variables:
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

> **Por qué hay un entrypoint**: Vite reemplaza las `VITE_*` al COMPILAR, pero CapRover
> define sus variables al ARRANCAR el contenedor. La imagen se compila con marcadores
> (`__VITE_SUPABASE_URL__`) y `docker-entrypoint.sh` los reemplaza en el bundle al iniciar.
> Ventajas: la misma imagen sirve para cualquier entorno, las credenciales no quedan
> grabadas en la imagen y se pueden rotar sin recompilar. Si falta una variable, el
> contenedor no arranca y lo dice en el log.
>
> Al agregar una `VITE_*` nueva hay que sumarla en tres lugares: el `ENV` con marcador del
> `Dockerfile`, el `sed` de `docker-entrypoint.sh` y las variables de CapRover.

`nginx.conf` tiene el fallback SPA (`try_files … /index.html`) — sin eso, entrar directo a
`/remitos` o recargar da 404. El `index.html` va con `no-store` para que tras cada deploy
el navegador tome los assets nuevos.

---

## Módulos del sistema

| Módulo | Estado | Tablas Supabase | Notas |
|--------|--------|-----------------|-------|
| Auth | Completo | `user_roles` | Login **real** con Supabase auth. Alta solo por invitación del admin |
| Dashboard | UI lista | — | `/dashboard` con navegador lateral (AppLayout). Cards de resumen placeholder |
| Productos | Completo | `productos` | `/productos` estilo CRM: buscador (nombre/medida/categoría), precio, badge de visibilidad web y estrella de destacado. Modal de edición completo en secciones (Información / Dimensiones / Comercial / Producción / Web) |
| Clientes | Completo | `clientes` | `/clientes` estilo CRM: buscador (nombre/CUIT/email/teléfono), alta y edición por modal. CUIT único con formato validado en la base |
| Remitos | Completo | `remitos`, `items_remito` | `/remitos`: creación con cliente + items (RPC `crear_remito`), filtro por estado, avance de estado y anulación con confirmación. Badges de estado y de cobro independientes |
| Finanzas | Completo | `cobros` | `/finanzas`: pendientes de cobro agrupados por cliente con selección múltiple, cobro con precios editables (RPC `cobrar_remitos`) e historial de cobros |
| Web | Pendiente | — | Controla el contenido de la landing page pública. "Pronto" en el sidebar |

Estados posibles: `Pendiente` / `En desarrollo` / `UI lista` / `Completo`

---

## Base de datos — Tablas creadas

```
- user_roles   → rol de cada usuario (id → auth.users, nombre, rol)
- productos    → catálogo de cajas. RLS: solo admin (lectura y escritura separadas
                 por comando, WITH CHECK en escritura). Columnas: nombre, medida,
                 slug, categoria, descripcion, largo/ancho/alto (cm), precio,
                 unidad_minima, desc_x100/x250/x500, tipo_carton, plazo_entrega,
                 admite_impresion, imagen_url, activo, destacado
- clientes     → razon_social, cuit (único), condicion_iva, telefono, email,
                 direccion_entrega
- remitos      → numero (IDENTITY), cliente_id, estado, cobro_id, notas
- items_remito → remito_id, producto_id, cantidad, precio_unitario (null hasta cobrar)
- cobros       → numero (IDENTITY), cliente_id, metodo, nro_factura, total, fecha, notas
```

> **Trigger `productos_normalizar`** (BEFORE INSERT/UPDATE): `medida` se autogenera desde
> largo × ancho × alto (no editarla a mano) y `slug` se autogenera desde `nombre` si queda
> vacío (con sufijo -2, -3… si colisiona). El frontend nunca envía `medida`.

La tabla `clientes` (razon_social, cuit ÚNICO con formato validado, condicion_iva con CHECK,
telefono, email, direccion_entrega) sigue el mismo patrón de RLS solo-admin que `productos`.

### Módulo Remitos + Finanzas (construido 2026-08-08)

* Tablas: `remitos` (numero IDENTITY, cliente_id, estado, cobro_id null = pendiente de cobro),
  `items_remito` (producto_id, cantidad, precio_unitario **null hasta cobrar**, UNIQUE
  remito+producto), `cobros` (numero IDENTITY, cliente_id, metodo con CHECK
  efectivo/transferencia/facturado, nro_factura opcional, total, fecha). Todas RLS solo-admin.
* Estados de remito: `nuevo → preparando → entregado` + `anulado`. El trigger
  `remitos_validar_transicion` valida transiciones, prohíbe cambiar el estado de un remito
  cobrado y exige estado `entregado` para asignar cobro_id. El estado de cobro es una
  dimensión APARTE (derivada de cobro_id), no un estado más de la cadena.
* **Sin precios al crear el remito** (decisión del cliente): se valoriza al cobrar. El
  CobroDialog sugiere el precio de catálogo vigente, editable; al confirmar, los precios se
  congelan en `items_remito.precio_unitario`.
* RPCs transaccionales (SECURITY INVOKER, EXECUTE solo para authenticated):
  `crear_remito(cliente, items, notas)` y
  `cobrar_remitos(remito_ids[], metodo, precios{item_id→precio}, nro_factura?, notas?)` —
  esta última exige remitos entregados, sin cobro previo y de un solo cliente, y usa
  `FOR UPDATE` contra cobros simultáneos. Cobros de remitos COMPLETOS (sin pagos parciales).
* Facturación manual por ahora (nro_factura a mano); afipsdk a futuro escribiría ahí.
* El flujo de cobro vive en `/finanzas` (pendientes agrupados por cliente + historial).
  Los hooks de finanzas reutilizan `SELECT_REMITO_DETALLE` de useRemitos.

Funciones y triggers creados:
* `public.tiene_rol(text)` — `SECURITY DEFINER`, `search_path` fijo, `EXECUTE` solo para
  `authenticated`. Usarla en toda política RLS que chequee rol.
* `public.handle_new_user()` — trigger `on_auth_user_created` sobre `auth.users`: crea la fila
  en `user_roles` con rol `admin`. `EXECUTE` revocado a todos (solo la usa el trigger).
* `set_updated_at` — trigger de `moddatetime` sobre `user_roles`.

---

## Roles del sistema

| Rol | Permisos |
|-----|----------|
| admin | Acceso total al sistema |

Los roles definitivos todavía no están definidos. Por ahora existe solo `admin`.
Al sumar roles nuevos hay que actualizar: la constante `ROLES` de
[src/features/auth/types.ts](src/features/auth/types.ts), el `CHECK` de la tabla `user_roles` en
Supabase y esta tabla.

**Alta de usuarios**: solo por invitación del administrador, desde Supabase → Authentication →
Users → "Add user". El trigger `handle_new_user` le crea la fila en `user_roles` con rol `admin`.
El signup público debe quedar DESHABILITADO en el dashboard (ver `ai-pmp/security-rules.txt` §1).

> Cuando se sumen roles de menor privilegio, cambiar el rol por defecto del trigger
> `handle_new_user` — el default debe ser siempre el de MENOR privilegio del sistema.

---

## Checklist de seguridad

- [ ] Signup público deshabilitado en el dashboard (verificar `disable_signup`) — **PENDIENTE**
- [x] Ninguna política `FOR ALL` para lecturas, ninguna con `(true)`, ninguna que dependa solo de `auth.uid() IS NOT NULL`
- [ ] Buckets de storage privados + signed URLs para datos de clientes (no hay storage todavía)
- [x] Tabla `user_roles` con RLS propio: nadie puede modificar su rol desde el cliente
- [x] Función `tiene_rol()` con `SECURITY DEFINER` creada (+ `EXECUTE` revocado a `anon`)
- [x] Trigger `handle_new_user` creado
- [ ] Toda tabla nueva: RLS habilitado + `WITH CHECK` en políticas de escritura
- [ ] Toda tabla nueva: trigger de `updated_at` + constraints SQL (`CHECK`, `NOT NULL`, FKs)
- [ ] Campos de dinero en `numeric(12,2)` — nunca float
- [ ] Después de cada cambio de schema: correr `get_advisors` del MCP y corregir alertas

---

## Decisiones técnicas tomadas

* **Tailwind 3.4 + postcss.config.js** (no v4) para evitar conflictos con shadcn/ui, según `rules.txt`.
* **shadcn/ui instalado a mano**: `components.json` está configurado con los alias del proyecto
  (`@/shared/components/ui`), pero los componentes se escribieron directamente en vez de correr
  `npx shadcn@latest init` (que es interactivo). Para agregar uno nuevo:
  `npx shadcn@latest add [componente]` — respeta los alias de `components.json`.
* **Sesión centralizada en un solo archivo**: toda la lógica de sesión vive en
  [src/features/auth/hooks/useAuth.tsx](src/features/auth/hooks/useAuth.tsx) — es el único archivo
  que conoce Supabase auth; el resto del sistema consume `useAuth()`. Usa `getSession()` para la
  sesión inicial y `onAuthStateChange()` para mantenerla sincronizada (login, logout, refresh de
  token y cambios en otra pestaña). El rol se lee de `user_roles` y es solo UX — la autorización
  real es el RLS.
* **Autenticado ≠ autorizado**: si hay sesión pero el usuario no tiene fila válida en `user_roles`,
  `useAuth` expone `sinAutorizacion: true` y `ProtectedRoute` muestra
  [SinAutorizacion.tsx](src/features/auth/components/SinAutorizacion.tsx). Sin eso el usuario
  quedaría rebotando al login sin explicación.
* **`RutaPublica`**: el login redirige al dashboard si ya hay sesión abierta.
* **Validación del password en el login**: solo se exige que no esté vacío. El largo mínimo lo
  valida Supabase al CREAR la contraseña — pedirlo en el login rechazaría contraseñas legítimas
  creadas antes de endurecer la política.
* **Rutas centralizadas** en [src/app/rutas.ts](src/app/rutas.ts). `RUTA_INICIO` = `/dashboard`.
* **Navegación centralizada** en [src/app/navegacion.ts](src/app/navegacion.ts): un array de items
  alimenta el sidebar. Los módulos sin página van con `proximamente: true` (se ven deshabilitados).
  Al crear la página de un módulo, quitarle esa marca.
* **Layout autenticado**: las rutas con sesión se envuelven en `AppLayout` (sidebar fijo a la
  izquierda + `<Outlet />`). El sidebar y el menú de usuario están en `shared/components/layout/`.
* **Suspense DENTRO del layout, no alrededor de las rutas**: el boundary de las páginas lazy
  vive en `AppLayout` (fallback `CargaContenido`, skeletons del área de contenido), así el
  sidebar nunca se desmonta al navegar. Además `BrowserRouter` lleva
  `future={{ v7_startTransition: true }}`: la página actual queda visible mientras se descarga
  la siguiente. No volver a envolver rutas individuales en Suspense propio.
* **Páginas a ancho completo**: el contenido de las páginas autenticadas usa todo el ancho
  disponible (`p-6 md:p-8`, sin `max-w-*` ni `mx-auto`). No volver a poner topes de ancho en
  módulos nuevos salvo pedido explícito.
* **No se creó página 404**: las rutas desconocidas redirigen al dashboard.
* **Cliente Supabase único** en
  [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts); tipos generados con
  el MCP en `integrations/supabase/types.ts` (regenerarlos con `generate_typescript_types` después
  de cada cambio de schema). Las credenciales van en `.env` (ignorado por git) — la anon key nunca
  hardcodeada, para poder rotarla sin tocar código.
* **Deps de UI agregadas**: `@radix-ui/react-dropdown-menu` y `@radix-ui/react-avatar` para el
  menú de usuario del sidebar; `@radix-ui/react-dialog` y `@radix-ui/react-checkbox` para el modal
  de edición de productos.
* **Productos con datos reales**: los hooks de
  [useProductos.ts](src/features/productos/hooks/useProductos.ts) consultan la tabla `productos`.
  El tipo `Producto` se deriva de los tipos generados (`Database["public"]["Tables"]...`), no se
  define a mano. Los textos opcionales vacíos se convierten a `null` en la mutación (`aNulo`),
  lo que además dispara la autogeneración del slug.
* **Formulario de producto en secciones**: para respetar el límite de 300 líneas, el modal se
  compone de `CamposGenerales` + `CamposComerciales`, con helpers `CampoNumerico` (vacío → null)
  y `CampoBooleano` reutilizables en `features/productos/components/`.
* **Select nativo estilizado** en
  [src/shared/components/ui/native-select.tsx](src/shared/components/ui/native-select.tsx) para
  listas cortas y fijas (ej. condición de IVA) — evita sumar `@radix-ui/react-select`.
* **Formato de moneda centralizado** en
  [src/shared/utils/formatCurrency.ts](src/shared/utils/formatCurrency.ts) (`Intl`, es-AR/ARS),
  usado en la columna de precio. Fechas: [src/shared/utils/formatDate.ts](src/shared/utils/formatDate.ts).
* **Paleta de marca aplicada** (derivada de la landing, estilo corporativo): cartón `#9c6b31`
  = `--primary` (acciones primarias e item activo del menú), verde petróleo `#405050` =
  `--secondary`. Neutros de la landing + colores funcionales nuevos (`--success`, `--warning`,
  `--info`) para estados del panel. Todo vive en [src/index.css](src/index.css) (HSL, modo claro
  y oscuro) y está expuesto en `tailwind.config.js`. Tipografía **Poppins** (Google Fonts,
  400–700) como `font-sans`. Regla intacta: nunca hardcodear colores en componentes — solo tokens.
* **Sidebar blanco**: los tokens `--sidebar-*` definen una superficie clara; el contenido va sobre
  `bg-muted` para que el sidebar se lea como panel separado. El item activo se marca con el cartón
  (`--sidebar-primary`). Todo el uso de esos tokens está contenido en `Sidebar.tsx` y `UserMenu.tsx`.
* **Dos versiones del logo** en `src/assets/`: `logo-full-box.png` (cartón) en el login y
  `logogrisoscuro.png` (gris oscuro) en el sidebar blanco. Al cambiar el fondo de alguno de los
  dos, elegir la versión que contraste — no aplicar filtros CSS de inversión.

---

## Estado actual del desarrollo

**Última sesión**: 2026-08-08
**Próximo paso**: probar el circuito completo Remitos → Finanzas con datos reales y ajustar lo
que pida el cliente. Después: módulo Web. Pendientes de dashboard: cerrar signup público y
activar leaked password protection.

**Lo que está funcionando**:
* Estructura base del proyecto según `rules.txt` (`app/`, `features/`, `shared/`, `lib/`, `integrations/`)
* Vite + TypeScript strict + Tailwind + shadcn/ui + React Query + React Router configurados
* Página `/auth/login` con React Hook Form + Zod, errores inline y toast destructive
* **Login real con Supabase**: `signInWithPassword`, sesión persistida entre recargas, rol leído
  de `user_roles`, cierre de sesión y errores traducidos a mensajes para el usuario
* **Dashboard** (`/dashboard`) con navegador lateral fijo a la izquierda (AppLayout + Sidebar + UserMenu)
* **Productos** (`/productos`) conectado a Supabase: tabla estilo CRM con buscador (nombre,
  medida o categoría), columna de precio (o «Consultar»), badge Visible/Oculto, estrella de
  destacado y fecha de alta. Modal de edición completo: información, dimensiones (medida
  autogenerada), comercial (precio, mínimos, descuentos), producción y web
* **Clientes** (`/clientes`) conectado a Supabase: buscador (nombre/CUIT/email/teléfono),
  alta con «Nuevo cliente» y edición por modal. CUIT único (formato validado por CHECK) con
  mensaje amigable ante duplicados; condición de IVA con select nativo
* **Remitos** (`/remitos`): creación transaccional (cliente + productos con cantidades),
  filtros por estado y búsqueda, avance de estado desde el menú de cada fila y anulación
  con diálogo de confirmación. Todo el circuito de estados validado por la base
* **Finanzas** (`/finanzas`): remitos entregados pendientes de cobro agrupados por cliente,
  selección múltiple, cobro con precios sugeridos del catálogo (editables) que se congelan
  al confirmar, método + nro de factura opcional, e historial de cobros con totales
* `ProtectedRoute` protegiendo las rutas autenticadas; menú de usuario con "Cerrar sesión"
* `ErrorBoundary` + `PaginaError` en el layout raíz
* `npx tsc --noEmit` y `npm run build` pasan sin errores

**Lo que está pendiente**:
* **Deshabilitar el signup público** en el dashboard (ver deuda técnica abajo)
* **Activar "Leaked password protection"** en Auth → Passwords (lo marca el advisor)
* Módulo Web (hoy visible en el sidebar como "Pronto", sin página)

**Problemas conocidos o deuda técnica**:
* **SEGURIDAD — signup público abierto**: `disable_signup` está en `false`. Como el trigger
  `handle_new_user` asigna rol `admin`, cualquiera con la anon key (que viaja en el bundle JS)
  puede registrarse y quedar como administrador. Cerrarlo en Authentication → Sign In / Providers
  → "Allow new users to sign up" = OFF. Verificar después con
  `GET /auth/v1/settings` (header `apikey`).
* El advisor de seguridad marca un WARN por `tiene_rol()` ejecutable por `authenticated`. Es
  **esperado y correcto**: las políticas RLS la necesitan. Solo devuelve un booleano sobre quien
  la llama (`auth.uid()`), no filtra datos de terceros.
* El bundle principal supera los 500 KB por `supabase-js`. Si molesta, se puede separar con
  `manualChunks`. No afecta la funcionalidad.

---

## Instrucciones para la IA

1. **Antes de escribir cualquier código**, leer los documentos de `ai-pmp/` referenciados arriba.
2. **No empezar nuevos módulos** sin que el usuario lo indique explícitamente.
3. **Antes de entregar cualquier cambio**: correr `npx tsc --noEmit` y verificar que no hay imports rotos ni errores.
4. **Si hay ambigüedad** en un requerimiento, preguntar antes de implementar.
5. **No agregar dependencias nuevas** sin consultarlo primero.
6. **Actualizar la tabla de módulos** de este archivo cuando se complete uno.
7. **El límite es 300 líneas por archivo** — si se supera, dividir en subarchivos o componentes.
8. **Nunca leer, imprimir ni commitear el contenido de `.env`** ni de ningún archivo con credenciales.
9. **Después de cualquier cambio de schema en Supabase**, correr `get_advisors` del MCP y corregir las alertas.
10. **Al terminar una sesión de trabajo**, actualizar la sección "Estado actual del desarrollo".
