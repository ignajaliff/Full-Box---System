import { useMemo } from "react"
import { ArrowRight, Box, Globe, Users, type LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"

import {
  RUTA_CLIENTES,
  RUTA_FINANZAS,
  RUTA_PRODUCTOS,
  RUTA_REMITOS,
} from "@/app/rutas"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useClientes } from "@/features/clientes/hooks/useClientes"
import { usePendientesCobro } from "@/features/finanzas/hooks/useFinanzas"
import { useProductos } from "@/features/productos/hooks/useProductos"
import { useRemitos } from "@/features/remitos/hooks/useRemitos"
import { PaginaConEncabezado } from "@/shared/components/layout/PaginaConEncabezado"
import {
  FilaIndicadores,
  FilaIndicadoresSkeleton,
  type Indicador,
} from "@/shared/components/layout/FilaIndicadores"
import { Card } from "@/shared/components/ui/card"

type Acceso = {
  titulo: string
  descripcion: string
  icono: LucideIcon
  /** Si el módulo ya tiene página, la tarjeta enlaza a su ruta. */
  ruta?: string
}

const ACCESOS: Acceso[] = [
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
    ruta: RUTA_CLIENTES,
  },
  {
    titulo: "Web",
    descripcion: "Contenido de la landing page pública",
    icono: Globe,
  },
]

export default function DashboardPage() {
  const { usuario } = useAuth()
  const productos = useProductos()
  const clientes = useClientes()
  const remitos = useRemitos()
  const pendientes = usePendientesCobro()

  const cargando =
    productos.isLoading ||
    clientes.isLoading ||
    remitos.isLoading ||
    pendientes.isLoading

  const resumen = useMemo<Indicador[] | null>(() => {
    if (!productos.data || !clientes.data || !remitos.data || !pendientes.data) {
      return null
    }

    const enFabrica = remitos.data.filter(
      (remito) => remito.estado === "nuevo" || remito.estado === "preparando"
    ).length

    return [
      {
        etiqueta: "Productos",
        valor: String(productos.data.length),
        detalle: `${productos.data.filter((p) => p.activo).length} visibles en la web`,
      },
      {
        etiqueta: "Clientes",
        valor: String(clientes.data.length),
        detalle: "en el registro",
      },
      {
        etiqueta: "Remitos en curso",
        valor: String(enFabrica),
        detalle: "nuevos o preparándose",
      },
      {
        etiqueta: "Pendientes de cobro",
        valor: String(pendientes.data.length),
        detalle: "entregados sin cobrar",
      },
    ]
  }, [productos.data, clientes.data, remitos.data, pendientes.data])

  return (
    <PaginaConEncabezado
      titulo={`Hola, ${usuario?.nombre ?? "bienvenido"}`}
      descripcion="Panel de control del sistema de gestión de Full Box."
    >
      {cargando ? <FilaIndicadoresSkeleton /> : null}
      {resumen ? (
        <FilaIndicadores
          indicadores={resumen}
          etiquetaAccesible="Resumen del sistema"
        />
      ) : null}

      <section
        aria-label="Accesos a los módulos"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {ACCESOS.map((acceso) => {
          const Icono = acceso.icono

          const contenido = (
            <div className="flex items-start gap-3 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-primary/10 text-primary">
                <Icono
                  className="h-4 w-4"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                  {acceso.titulo}
                  {acceso.ruta ? (
                    <ArrowRight
                      className="h-3.5 w-3.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Pronto
                    </span>
                  )}
                </p>
                <p className="text-[12.5px] text-muted-foreground">
                  {acceso.descripcion}
                </p>
              </div>
            </div>
          )

          if (!acceso.ruta) {
            return (
              <Card key={acceso.titulo} className="rounded-xl">
                {contenido}
              </Card>
            )
          }

          return (
            <Card
              key={acceso.titulo}
              className="rounded-xl transition-colors hover:bg-muted/40"
            >
              <Link
                to={acceso.ruta}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {contenido}
              </Link>
            </Card>
          )
        })}
      </section>

      <Card className="rounded-xl">
        <div className="space-y-1 p-5">
          <p className="text-[15px] font-semibold">Circuito del sistema</p>
          <p className="text-[12.5px] text-muted-foreground">
            Los pedidos se cargan como remitos en{" "}
            <Link to={RUTA_REMITOS} className="text-primary hover:underline">
              Remitos
            </Link>{" "}
            y se valorizan al cobrarlos desde{" "}
            <Link to={RUTA_FINANZAS} className="text-primary hover:underline">
              Finanzas
            </Link>
            . El módulo Web se habilita más adelante.
          </p>
        </div>
      </Card>
    </PaginaConEncabezado>
  )
}
