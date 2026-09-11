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
| Productos | Completo | `productos` | `/productos` estilo CRM: buscador (nombre/medida/categoría), precio, switch de visibilidad web y estrella de destacado. Alta, edición (panel lateral por secciones: Información / Dimensiones / Comercial / Producción / Web), foto y borrado. **Tramos de precio por cantidad** (hasta 4, `tramos_precio`) en vez de descuentos fijos. Arriba, el cotizador **Caja personalizada** (ver deuda técnica: tarifa hardcodeada) |
| Clientes | Completo | `clientes` | `/clientes` estilo CRM: buscador (nombre/CUIT/email/teléfono), alta y edición por modal. CUIT único con formato validado en la base |
| Remitos | Completo | `remitos`, `items_remito` | `/remitos`: alta y **edición** con cliente + items (RPCs `crear_remito` / `editar_remito`), chips de filtro por estado, botón de avance en cada fila, **edición al clickear la fila**
(panel lateral, igual que Productos) y menú «⋯» solo para anular. Badges de estado y de cobro independientes |
| Finanzas | Completo | `cobros` | Dos subpáginas: `/finanzas/historial` (cobros con desglose desplegable y buscador) y `/finanzas/pendientes` (agrupados por cliente, selección múltiple y cobro con precios editables vía RPC `cobrar_remitos`). `/finanzas` redirige al historial |
| Web | Pendiente | — | Controla el contenido de la landing page pública. "Pronto" en el sidebar |

Estados posibles: `Pendiente` / `En desarrollo` / `UI lista` / `Completo`

---

## Base de datos — Tablas creadas

```
- user_roles   → rol de cada usuario (id → auth.users, nombre, rol)
- productos    → catálogo de cajas. RLS: solo admin (lectura y escritura separadas
                 por comando, WITH CHECK en escritura). Columnas: nombre, medida,
                 slug, categoria, descripcion, largo/ancho/alto (cm), precio,
                 unidad_minima, tramos_precio (jsonb, hasta 4 {cantidad, precio}),
                 desc_x100/x250/x500 (TRANSITORIAS, ver deuda), tipo_carton, plazo_entrega,
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
  `crear_remito(cliente, items, notas)`,
  `editar_remito(remito_id, cliente, items, notas)` — reemplaza cliente, notas e items de un
  remito; usa `FOR UPDATE` y rechaza remitos cobrados o anulados, listas vacías, productos
  repetidos y cantidades < 1. Los items se borran y reinsertan sin precio (se valoriza al
  cobrar). SQL en [supabase/editar_remito.sql](supabase/editar_remito.sql) — y
  `cobrar_remitos(remito_ids[], metodo, precios{item_id→precio}, nro_factura?, notas?)` —
  esta última exige remitos entregados, sin cobro previo y de un solo cliente, y usa
  `FOR UPDATE` contra cobros simultáneos. Cobros de remitos COMPLETOS (sin pagos parciales).
* Facturación manual por ahora (nro_factura a mano); afipsdk a futuro escribiría ahí.
* El flujo de cobro vive en `/finanzas` (pendientes agrupados por cliente + historial).
  Los hooks de finanzas reutilizan `SELECT_REMITO_DETALLE` de useRemitos.
* **Cobro como vista de la página** (2026-08-17): al cobrar los remitos seleccionados no se
  abre un modal sino [CobroVista](src/features/finanzas/components/CobroVista.tsx), que
  **reemplaza el contenido de FinanzasPage** con un `return` temprano cuando hay remitos en
  `cobrando`. Se probó antes a pantalla completa (`fixed inset-0` sobre el layout) y el
  cliente lo rechazó: **el navegador lateral tiene que quedar visible**. No es una ruta — el
  flujo nace de una selección y no tiene sentido entrar por URL. Usa `PaginaConEncabezado`
  como cualquier otra página (título «Cobrar a [cliente]», «Volver» en las acciones), con una
  tarjeta por remito y sus items con precio editable. El total y «Confirmar cobro» van en una
  **tarjeta al final**, no en un pie fijo: dentro del área de contenido un pie fijo quedaría
  flotando sobre el lienzo. Se le da toda el área útil porque el cobro congela precios y es
  irreversible.
* **Historial de cobros desplegable** (2026-08-17): clickear una fila de `TablaCobros` abre
  el desglose (remitos del cobro + items con cantidad, precio congelado y subtotal). Para eso
  `obtenerCobros` suma el join anidado `remitos(... items:items_remito(...))` — así el
  desglose no dispara una consulta por fila. Un solo cobro abierto a la vez.
* **Finanzas dividido en dos subpáginas** (2026-08-18): `FinanzasPage` se eliminó y quedó
  [HistorialPage](src/features/finanzas/pages/HistorialPage.tsx) (con buscador por N°, cliente,
  método o factura) y [PendientesPage](src/features/finanzas/pages/PendientesPage.tsx). El
  cálculo compartido (agrupado por cliente + fila de indicadores) vive en
  [useResumenFinanzas](src/features/finanzas/hooks/useResumenFinanzas.ts) para no duplicarlo:
  las dos vistas muestran el MISMO resumen. Al confirmar un cobro, `PendientesPage` navega al
  historial — el remito ya no está pendiente y volver a esa lista no mostraría nada, por eso
  `CobroVista` distingue `onCancelar` de `onConfirmado`.
* **Pendientes a ancho completo** (2026-08-18): `PendientesPorCliente` dejó la grilla de dos
  columnas (los items se truncaban en media tarjeta). Ahora es una tarjeta por cliente a ancho
  completo, con checkbox de «todos los del cliente» en el encabezado, cada remito como fila
  clickeable entera (el checkbox va `pointer-events-none`, solo indica), los items uno por
  línea y un pie con el TOTAL ESTIMADO según precios de catálogo — estimado, porque el
  definitivo se congela recién al cobrar.

Funciones y triggers creados:
* `public.tiene_rol(text)` — `SECURITY DEFINER`, `search_path` fijo, `EXECUTE` solo para
  `authenticated`. Usarla en toda política RLS que chequee rol.
* `public.handle_new_user()` — trigger `on_auth_user_created` sobre `auth.users`: crea la fila
  en `user_roles` con rol `pendiente` (NO otorga privilegios). `EXECUTE` revocado a todos
  (solo la usa el trigger). Ver [supabase/handle_new_user_pendiente.sql](supabase/handle_new_user_pendiente.sql).
* `set_updated_at` — trigger de `moddatetime` sobre `user_roles`.

---

## Roles del sistema

| Rol | Permisos |
|-----|----------|
| admin | Acceso total al sistema |
| pendiente | Ninguno. Pasa el login pero no pasa el RLS: ve "Sin autorización" |

Los roles definitivos todavía no están definidos. Por ahora existe solo `admin`.
Al sumar roles nuevos hay que actualizar: la constante `ROLES` de
[src/features/auth/types.ts](src/features/auth/types.ts), el `CHECK` de la tabla `user_roles` en
Supabase y esta tabla.

**Alta de usuarios**: solo por invitación del administrador, desde Supabase → Authentication →
Users → "Add user". El trigger `handle_new_user` le crea la fila en `user_roles` con rol
`pendiente`; el admin lo habilita a mano:
`update public.user_roles set rol = 'admin' where id = '<uuid>';`
El signup público debe quedar DESHABILITADO en el dashboard (ver `ai-pmp/security-rules.txt` §1).

> Cuando se sumen roles de menor privilegio, cambiar el rol por defecto del trigger
> `handle_new_user` — el default debe ser siempre el de MENOR privilegio del sistema.
> Hoy ese default es `pendiente`, que no otorga ningún permiso.

---

## Checklist de seguridad

- [x] Signup público deshabilitado en el dashboard (`disable_signup: true`, 2026-09-10).
      Verificado con un POST real a `/auth/v1/signup`: devuelve 422 `signup_disabled`
- [x] El alta de usuario NO otorga privilegios: `handle_new_user` crea la fila con rol
      `pendiente` (2026-09-10). Mitiga el signup abierto, pero no lo reemplaza
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
* **Módulos con subpáginas** (2026-08-18): un item de `navegacion.ts` puede llevar `subitems`
  (etiqueta + ruta). El sidebar los despliega DEBAJO del padre cuando su ruta está activa
  (`pathname.startsWith(item.ruta)`), indentados y con una guía vertical `border-l`. El item
  padre navega a su propia ruta, que **debe redirigir a la primera subpágina** — no existe
  página propia del módulo. Finanzas es el caso de referencia: `/finanzas` →
  `/finanzas/historial`. Contrastes del subitem sobre el sidebar oscuro: inactivo 4.88,
  activo 6.16, hover 7.85 (todos AA).
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
* **Tramos de precio por cantidad** (2026-09-11, reemplaza a `desc_x100/x250/x500`): los tres
  descuentos porcentuales fijos no servían para casos reales como «mínimo 20 y un solo tramo
  en 60». Ahora `productos.tramos_precio` (jsonb) guarda **hasta 4** tramos `{cantidad, precio}`:
  desde esa cantidad, ese precio unitario. Se eligió jsonb y no una tabla aparte porque el tope
  es 4, se edita siempre junto al producto (un solo UPDATE, sin RPC) y la landing lo lee con el
  mismo `select("*")`. La base lo valida en un CHECK con `tramos_precio_validos(tramos,
  unidad_minima)` (IMMUTABLE, sin acceso a tablas): array ≤ 4, cantidad entera **> unidad_minima**,
  creciente y sin repetir, precio ≥ 0. SQL en [supabase/tramos_precio.sql](supabase/tramos_precio.sql).
  Frontend: `TramoPrecio` + `leerTramos(json)` + `MAX_TRAMOS` en `productos/types.ts` (el tipo
  generado es `Json`, hay que validar la forma al leer); el schema exige lo mismo que la base con
  mensajes por fila (`superRefine`) salvo el orden, que se aplica al guardar (`aFilaProducto`
  ordena). UI en [CamposTramos](src/features/productos/components/CamposTramos.tsx): filas
  dinámicas con `useFieldArray`, vista previa «100+ u. → $1.400 c/u» y botón «Agregar tramo»
  hasta el tope. `CampoNumerico` acepta rutas indexadas (`tramos.${n}.cantidad`). Los descuentos
  que había (eran los defaults 8/15/22, nadie los cargó) se migraron a tramos con el precio
  resultante.
* **Select nativo estilizado** en
  [src/shared/components/ui/native-select.tsx](src/shared/components/ui/native-select.tsx) para
  listas cortas y fijas (ej. condición de IVA) — evita sumar `@radix-ui/react-select`.
* **Combobox con buscador propio** en
  [src/shared/components/ui/combobox.tsx](src/shared/components/ui/combobox.tsx), hecho con
  primitivas de React (sin `cmdk` ni popover nuevos): botón trigger + lista filtrable con
  teclado (flechas/Enter/Escape con `stopPropagation` para no cerrar el diálogo contenedor).
  Es el control para listas largas o crecientes (clientes, productos — lo usa RemitoForm);
  `NativeSelect` queda para listas cortas y fijas. El panel de remitos usa
  `variante="panel"` ensanchado con `className="sm:max-w-2xl"`.
* **Formato de moneda centralizado** en
  [src/shared/utils/formatCurrency.ts](src/shared/utils/formatCurrency.ts) (`Intl`, es-AR/ARS),
  usado en la columna de precio. Fechas: [src/shared/utils/formatDate.ts](src/shared/utils/formatDate.ts).
* **Paleta cálida alineada a la landing** (2026-08-17, reemplaza los neutros grises): el
  sistema se veía genérico porque TODO su andamiaje neutro era gris frío (matiz 220). Ahora
  usa la paleta del sitio público (`Full Box -- LANDINGPAGE/src/app/globals.css`): cartón
  tostado `#A97538` = `--primary`, kraft `#A27F6D` = `--ring`, charcoal `#333` =
  `--foreground`, `--shell` BLANCO (se probó crema y el cliente lo rechazó — el recorte de
  las tarjetas lo dan borde y sombra, no el fondo), y neutros cálidos (bordes `#e6dfd0`, muted
  `#f3efe6`, gris cálido `#7a6b60` — regla de la landing: "kraft desaturado, gris cálido, no
  frío"). Verde petróleo `#405050` sigue como `--secondary` (panel del login). Funcionales
  (`--success`, `--warning`, `--info`) sin cambio. El dark es charcoal cálido con texto crema.
  Sombra cálida `hsl(28 25% 35% / .07)` en card/shell/sidebar. Todo vive en
  [src/index.css](src/index.css) y está expuesto en `tailwind.config.js`. Regla intacta:
  nunca hardcodear colores en componentes — solo tokens.
* **Layout a ras, sin shell** (2026-08-17, a pedido del cliente): se probó el shell con
  sidebar y contenido flotando como tarjetas y NO gustó. Ahora ocupan la pantalla completa
  y los separa **una sola línea vertical** (el `border-r` del sidebar, que va `bg-sidebar`
  sin radio ni sombra). El token `--shell` quedó sin uso. Separadores
  internos con `--hairline`. **Dos niveles de línea** (ajustado 2026-08-17 porque las tarjetas
  no se distinguían del fondo): `--border` (`220 13% 87%`) es el CONTORNO de tarjetas y
  controles y tiene que leerse; `--hairline` (`220 13% 92%`) es el separador INTERNO de una
  tarjeta y va más suave. El shell subió a `220 16% 95.5%` para despegar el blanco. Sombra
  única `0 1px 2px hsl(220 20% 50% / .06)` definida en `card.tsx` — **no anularla con
  `shadow-none`** en las páginas, como se hacía antes. Tablas con thead tintado
  (`--table-head` / `--table-head-foreground`), filas `py-2.5` y encabezados sentence case.
  Tipografía: **Instrument Sans** como `font-sans` (reemplazó a Poppins) y **Spline Sans Mono**
  como `font-mono` — **toda cifra del panel (precios, medidas, fechas, contadores) va en
  `font-mono` + `tabular-nums`**. Badges "pill" suaves (`success-soft`, `muted` en `badge.tsx`).
  Sidebar: tarjeta de 224px, logo centrado con hairline, eyebrow "MENÚ PRINCIPAL", item activo
  `bg-primary/10 text-primary` (ya no cartón sólido). Botón primario con `active:scale-[.985]`.
  Los módulos nuevos deben seguir este lenguaje (ver ProductosPage como referencia).
* **El estilo CRM es el estándar de TODO el sistema** (2026-08-14): se extendió a Dashboard,
  Clientes, Remitos y Finanzas. Para no repetirlo, el lenguaje vive en cuatro componentes de
  `shared/components/layout/` que **toda página nueva debe usar**:
  `EncabezadoPagina` (título + bajada + acciones, cerrado con hairline), `FilaIndicadores`
  (+ `FilaIndicadoresSkeleton`; un contenedor con divisores internos, cifras en mono),
  `BarraFiltros` + `ChipsFiltro` (buscador fuera de la tarjeta, chips de filtro, contador a
  la derecha) y `EstadoVacio`. Estructura de página:
  `<div className="flex flex-col gap-[18px] p-6 pb-12 md:px-7">` → encabezado → indicadores →
  filtros → `<Card className="overflow-hidden rounded-xl shadow-none">` con la tabla.
  Las tablas comparten `CLASE_TH` (`h-11 text-[11px] font-bold uppercase
  tracking-[0.05em] text-table-head-foreground`), un `<TableHeader>` con
  `border-b border-border bg-table-head` + divisores verticales
  (`[&_th:not(:last-child)]:border-r`), `[&_td]:py-2.5` y filas
  `border-hairline hover:bg-muted/40`.
* **Encabezados marcados y cartón al mínimo** (2026-08-17, a pedido del cliente): el thead
  usa un **gris neutro claro** (`--table-head: 40 10% 96%`, no la crema anterior), más alto
  (44px), con texto CHICO en negrita y mayúsculas (11px bold) y divisores verticales entre
  columnas — la banda se separa por el borde y los divisores, no por un fondo pesado
  (texto 6.56:1, AA). El cartón dejó de pintar bloques: los tiles
  de iniciales (Clientes y Productos) y el chip de filtro activo pasaron a neutros. **El
  cartón queda SOLO en dos detalles**: la estrella de destacado y el switch de publicado de
  Productos — más el sidebar, que es su superficie. Al agregar módulos, respetar ese límite.
* **Funcionales vivos pero cálidos** (2026-08-17): los estados son badges suaves (se probó
  pintar la celda entera y NO gustó, revertido). Sus colores pasaron por dos vueltas: primero
  se bajó la saturación al registro del cartón (~40%) y quedaron demasiado APAGADOS; ahora
  tienen **saturación alta (62-85%) con matices cálidos y luz baja**: `--success` verde
  `142 65% 26%`, `--warning-soft` ámbar `33 78% 30%`, `--info` azul `208 62% 34%`,
  `--destructive` `6 68% 40%`. Se distinguen de un vistazo sin verse genéricos junto al
  cartón. Contrastes de los badges suaves ≥ 4.5:1 (success 5.10, warning 4.76, info 5.72,
  destructive 5.48). Al tocar estos tokens, recalcular el contraste: subir saturación BAJA
  el contraste sobre el fondo tenue del badge, así que hay que compensar con la luz.
* **`DialogContent` con variante `panel`**: `dialog.tsx` acepta `variante="centrado" | "panel"`.
  El panel entra desde la derecha a alto completo (animación slide), con header fijo, campos
  scrolleables y footer fijo con botones al 50%. **Es el patrón de edición del sistema**
  (2026-08-17): lo usan Productos, Remitos y Clientes, los tres con `className="sm:max-w-2xl"`
  para compartir ancho. Los diálogos de CONFIRMACIÓN (anular remito) siguen centrados.
* **Switch de visibilidad en la tabla de productos**: la columna Web es un toggle directo
  (publicar/ocultar sin abrir el panel) vía `useAlternarVisibilidad` — mutación **optimista**
  con rollback y `stopPropagation` para no disparar el clic de la fila.
* **Sidebar gris oscuro del logo** (2026-08-17): se probaron verde petróleo, cartón saturado
  y marrón — todos pesaban visualmente. La superficie final es el **gris del propio logo**
  (`#383b3e` muestreado del PNG = `210 5% 23%`), un neutro apenas frío. El naranja de marca
  entra SOLO como detalle: el item activo lleva texto e icono en cartón (aclarado a
  `34 60% 70%` para llegar a AA como texto) más una **barra de 3px a la izquierda**, y el
  avatar del usuario. Al ser fondo oscuro, `Sidebar.tsx` y `UserMenu.tsx` usan
  **exclusivamente los tokens `sidebar-*`**. El logo va `brightness-0 invert` (su gris
  original es justo el de esta superficie). Contrastes: todos los textos ≥ 4.67:1.
* **Barra de encabezado alineada con el sidebar** (2026-08-17): el bloque del logo
  (`h-16`, sin padding lateral para que su línea cruce todo el ancho del sidebar) y
  `EncabezadoPagina` (`h-16`, contenido centrado con `items-center`) comparten altura, así
  sus bordes inferiores forman **una sola línea horizontal continua** de lado a lado. El
  borde lo dibuja la banda blanca de la página, no el componente. Si se cambia una altura,
  cambiar la otra. Tipografía de la barra: título `text-[17px] font-bold`, bajada
  `text-[12.5px]`. La barra admite bajada de UNA línea — al escribir la `descripcion` de un
  módulo nuevo, mantenerla corta.
* **`PaginaConEncabezado` es la estructura de TODA página** (2026-08-17): en vez de repetir
  las bandas, cada página envuelve su contenido en
  [PaginaConEncabezado](src/shared/components/layout/PaginaConEncabezado.tsx), que arma la
  barra blanca de 64px (título + acciones, cerrada por la línea que continúa la del logo del
  sidebar) y debajo el **lienzo gris** con los children. Ninguna página importa ya
  `EncabezadoPagina` directamente. Token `--lienzo` (`220 14% 96.5%`): gris **neutro** muy
  claro para el área de contenido — NO usar `--muted` ahí: es cálido y sobre superficie
  grande se lee anaranjado (mismo motivo por el que el buscador de `BarraFiltros` pasó a
  `bg-background`). Las tarjetas van blancas y se recortan contra el lienzo.
* **Uso de los dos logos**: dentro de la interfaz (sidebar y login) se usa siempre
  `src/assets/logogrisoscuro.png`. `src/assets/logo-full-box.png` (cartón) quedó como la
  versión de marca externa: es la fuente de los íconos de `public/`. Sobre fondos claros el
  gris oscuro va tal cual; en el panel verde del login se pasa a blanco con
  `brightness-0 invert` porque no existe un PNG blanco del logo.
* **Íconos del navegador** en `public/` (`favicon.ico` 16–64, `favicon.png` y
  `apple-touch-icon.png` de 512), enlazados desde `index.html`. Se generaron desde el logo
  cartón recortando la transparencia sobrante y centrándolo en un lienzo cuadrado con 8% de
  margen — el logo original es muy horizontal (2.28:1) y sin ese recentrado se ve aplastado
  en la pestaña. Si cambia el logo, regenerar los tres con ese mismo criterio.
* **Login a pantalla dividida**: panel de marca (verde petróleo `bg-secondary` + un radial
  sutil con el token `--primary`) a la izquierda y formulario a la derecha. Por debajo de `lg`
  el panel se oculta y el logo pasa arriba del título. El copy quedó en un solo mensaje —
  antes se repetía tres veces que el acceso es por invitación.

---

## Estado actual del desarrollo

**Última sesión**: 2026-09-11 — Productos pasó de tres descuentos fijos (100/250/500) a
**tramos de precio por cantidad** (hasta 4, `tramos_precio` jsonb validado en la base), con
migración de datos y formulario dinámico. Las columnas `desc_x*` siguen existiendo hasta que la
landing lea el formato nuevo. Antes (2026-09-10, socio): alta/foto/borrado de productos, bucket
`productos`, signup cerrado y rol `pendiente` por defecto.
**Próximo paso**: desplegar la landing (ya migrada a `tramos_precio` en código) y recién
entonces borrar `desc_x100/x250/x500` (PASO 2) y regenerar tipos en los dos proyectos. Luego
módulo Web. Pendiente de dashboard: leaked password protection.

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
* **Finanzas** en dos subpáginas desplegadas en el sidebar: `/finanzas/historial` (cobros
  con buscador y desglose desplegable por fila) y `/finanzas/pendientes` (remitos entregados
  agrupados por cliente, selección por remito o por cliente completo, y cobro con precios
  sugeridos del catálogo que se congelan al confirmar). `/finanzas` entra por el historial
* `ProtectedRoute` protegiendo las rutas autenticadas; menú de usuario con "Cerrar sesión"
* `ErrorBoundary` + `PaginaError` en el layout raíz
* `npx tsc --noEmit` y `npm run build` pasan sin errores

**Lo que está pendiente**:
* **Borrar `desc_x100/x250/x500`** (PASO 2 de [supabase/tramos_precio.sql](supabase/tramos_precio.sql)):
  la landing YA lee `tramos_precio` en su código (2026-09-11), pero hay que esperar a que esa
  versión esté **desplegada** — la publicada hoy todavía usa las columnas viejas
* **Activar "Leaked password protection"** en Auth → Passwords (lo marca el advisor)
* Módulo Web (hoy visible en el sidebar como "Pronto", sin página)

**Problemas conocidos o deuda técnica**:
* ~~**SEGURIDAD — signup público abierto**~~ — **RESUELTO el 2026-09-10**, en dos capas:
  `disable_signup: true` en el dashboard (un POST a `/auth/v1/signup` con la anon key devuelve
  422 `signup_disabled`) y el trigger `handle_new_user` creando la fila con rol `pendiente`,
  que no pasa el RLS. Si alguna vez se reabre el signup, la segunda capa sigue conteniendo.
  Reverificar con `GET /auth/v1/settings` (header `apikey`).
* El advisor de seguridad marca un WARN por `tiene_rol()` ejecutable por `authenticated`. Es
  **esperado y correcto**: las políticas RLS la necesitan. Solo devuelve un booleano sobre quien
  la llama (`auth.uid()`), no filtra datos de terceros.
* **`desc_x100/x250/x500` son TRANSITORIAS** (2026-09-11): el sistema ya no las lee ni escribe
  (usa `tramos_precio`), pero la landing todavía las consume y comparte el mismo proyecto de
  Supabase — borrarlas hoy dejaría precios `NaN` en la ficha pública. Sus defaults pasaron a 0
  para que un producto nuevo no muestre en la web descuentos que nadie cargó. Mientras dure la
  transición, **la web muestra los tramos viejos, no lo que se edita en el sistema**.
* **Cotizador de caja personalizada con tarifa hardcodeada** (2026-08-14): el bloque de
  `/productos` ([CajaPersonalizada.tsx](src/features/productos/components/CajaPersonalizada.tsx))
  calcula el precio con la constante `TARIFA` (precio del cartón por m², 15% de desperdicio de
  troquelado y 35% de margen) — números de referencia, NO los de la fábrica. La fórmula está
  aislada en `cotizar()` para que al crear la tabla de parámetros en Supabase solo haya que
  cambiar de dónde salen los tres valores. El botón «Cotizar» todavía no guarda nada: avisa
  por toast que falta la conexión.
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
