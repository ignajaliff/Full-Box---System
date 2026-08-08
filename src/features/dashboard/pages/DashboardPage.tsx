import { Box, Globe, Users, type LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { RUTA_PRODUCTOS } from "@/app/rutas"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

type ItemResumen = {
  titulo: string
  descripcion: string
  icono: LucideIcon
  /** Si el módulo ya tiene página, la card enlaza a su ruta. */
  ruta?: string
}

const RESUMEN: ItemResumen[] = [
  {
    titulo: "Productos",
    descripcion: "Catálogo de cajas de la fábrica",
    icono: Box,
    ruta: RUTA_PRODUCTOS,
  },
  {
    titulo: "Clientes",
    descripcion: "Registro de clientes y encargos",
    icono: Users,
  },
  {
    titulo: "Web",
    descripcion: "Contenido de la landing page pública",
    icono: Globe,
  },
]

export default function DashboardPage() {
  const { usuario } = useAuth()

  return (
    <div className="space-y-8 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {usuario?.nombre ?? "bienvenido"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Panel de control del sistema de gestión de Full Box.
        </p>
      </header>

      <section
        aria-label="Resumen del sistema"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {RESUMEN.map((item) => {
          const Icono = item.icono

          const contenido = (
            <>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{item.titulo}</CardTitle>
                <Icono
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <CardDescription>{item.descripcion}</CardDescription>
              </CardContent>
            </>
          )

          if (!item.ruta) {
            return <Card key={item.titulo}>{contenido}</Card>
          }

          return (
            <Card
              key={item.titulo}
              className="transition-shadow hover:shadow-md"
            >
              <Link
                to={item.ruta}
                className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contenido}
              </Link>
            </Card>
          )
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos pasos</CardTitle>
          <CardDescription>
            El sistema está en construcción. Los módulos se irán habilitando
            desde el navegador lateral a medida que se desarrollen.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
