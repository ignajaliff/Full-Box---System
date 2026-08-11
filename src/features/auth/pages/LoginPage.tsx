import logoFullBox from "@/assets/logogrisoscuro.png"
import { LoginForm } from "@/features/auth/components/LoginForm"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      {/* Panel de marca. Se oculta en pantallas chicas: ahí el formulario
          ocupa todo el ancho y el logo pasa arriba del título. */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-secondary p-12 text-secondary-foreground lg:flex xl:w-[55%]">
        {/* Luz cálida del cartón, apenas insinuada. Usa el token de marca,
            no un color suelto. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.35),transparent_55%)]"
        />

        <img
          src={logoFullBox}
          /* Decorativo: el logo que acompaña al título del formulario ya
             nombra la marca, y este solo se ve cuando aquel también está. */
          alt=""
          /* El logo es gris oscuro: se pasa a blanco para que contraste con
             el verde petróleo del panel. */
          className="relative h-12 w-auto self-start brightness-0 invert"
          loading="eager"
        />

        <div className="relative max-w-md space-y-4">
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            Toda la fábrica en un solo lugar
          </p>
          <p className="text-secondary-foreground/70">
            Productos, clientes, remitos y cobros. El circuito completo de
            Full Box, ordenado y al día.
          </p>
        </div>

        <p className="relative text-xs text-secondary-foreground/50">
          © {new Date().getFullYear()} Full Box
        </p>
      </aside>

      {/* Formulario */}
      <section className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:w-[45%]">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <img
            src={logoFullBox}
            alt="Full Box"
            className="h-16 w-auto sm:h-20"
            loading="eager"
          />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Ingresá a tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Usá las credenciales que te asignó el administrador.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  )
}
