import { useMemo, useState } from "react"
import { Plus, Users } from "lucide-react"

import { ClienteDialog } from "@/features/clientes/components/ClienteDialog"
import { TablaClientes } from "@/features/clientes/components/TablaClientes"
import { useClientes } from "@/features/clientes/hooks/useClientes"
import type { Cliente } from "@/features/clientes/types"
import { BarraFiltros } from "@/shared/components/layout/BarraFiltros"
import { PaginaConEncabezado } from "@/shared/components/layout/PaginaConEncabezado"
import { EstadoVacio } from "@/shared/components/layout/EstadoVacio"
import {
  FilaIndicadores,
  FilaIndicadoresSkeleton,
  type Indicador,
} from "@/shared/components/layout/FilaIndicadores"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

const FILAS_SKELETON = 5

function normalizar(texto: string) {
  return texto.toLocaleLowerCase("es").trim()
}

export default function ClientesPage() {
  const { data: clientes, isLoading, isError } = useClientes()
  const [busqueda, setBusqueda] = useState("")
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [clienteEnEdicion, setClienteEnEdicion] = useState<Cliente | null>(null)

  const filtrados = useMemo(() => {
    if (!clientes) return []
    const termino = normalizar(busqueda)
    if (!termino) return clientes

    return clientes.filter((cliente) =>
      [
        cliente.razon_social,
        cliente.cuit ?? "",
        cliente.email ?? "",
        cliente.telefono ?? "",
      ].some((campo) => normalizar(campo).includes(termino))
    )
  }, [clientes, busqueda])

  const resumen = useMemo<Indicador[] | null>(() => {
    if (!clientes) return null

    const conCuit = clientes.filter(
      (cliente) => cliente.cuit !== null && cliente.cuit.trim() !== ""
    ).length
    const conContacto = clientes.filter(
      (cliente) => cliente.email !== null || cliente.telefono !== null
    ).length
    const condiciones = new Set(
      clientes
        .map((cliente) => cliente.condicion_iva)
        .filter((condicion): condicion is string => condicion !== null)
    )

    return [
      {
        etiqueta: "Total de clientes",
        valor: String(clientes.length),
        detalle: "en el registro",
      },
      {
        etiqueta: "Con CUIT cargado",
        valor: String(conCuit),
        detalle: "listos para facturar",
      },
      {
        etiqueta: "Con contacto",
        valor: String(conContacto),
        detalle: "email o teléfono",
      },
      {
        etiqueta: "Condiciones de IVA",
        valor: String(condiciones.size),
        detalle: "distintas en uso",
      },
    ]
  }, [clientes])

  function abrirAlta() {
    setClienteEnEdicion(null)
    setDialogoAbierto(true)
  }

  function abrirEdicion(cliente: Cliente) {
    setClienteEnEdicion(cliente)
    setDialogoAbierto(true)
  }

  return (
    <PaginaConEncabezado
      titulo="Clientes"
      descripcion="Registro de clientes de la fábrica, base para remitos y facturación."
      acciones={
        <Button size="sm" className="h-9" onClick={abrirAlta}>
          <Plus aria-hidden="true" />
          Nuevo cliente
        </Button>
      }
    >
      {isLoading ? <FilaIndicadoresSkeleton /> : null}
      {resumen ? (
        <FilaIndicadores
          indicadores={resumen}
          etiquetaAccesible="Resumen de clientes"
        />
      ) : null}

      <BarraFiltros
        busqueda={busqueda}
        onBuscar={setBusqueda}
        placeholder="Buscar por nombre, CUIT, email o teléfono…"
        etiquetaBusqueda="Buscar clientes"
        contador={
          clientes
            ? `${filtrados.length} de ${clientes.length} clientes`
            : undefined
        }
      />

      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los clientes. Intentá recargar la página.
        </p>
      ) : (
        <Card className="overflow-hidden rounded-xl">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: FILAS_SKELETON }).map((_, indice) => (
                <Skeleton key={indice} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {clientes && filtrados.length > 0 ? (
            <TablaClientes clientes={filtrados} onEditar={abrirEdicion} />
          ) : null}

          {clientes && filtrados.length === 0 ? (
            <EstadoVacio
              icono={Users}
              titulo={
                clientes.length === 0
                  ? "Todavía no hay clientes cargados"
                  : "Sin resultados para esa búsqueda"
              }
              descripcion={
                clientes.length === 0
                  ? "Creá el primero con el botón «Nuevo cliente»."
                  : "Probá con otro nombre, CUIT o teléfono."
              }
            />
          ) : null}
        </Card>
      )}

      <ClienteDialog
        abierto={dialogoAbierto}
        cliente={clienteEnEdicion}
        onCerrar={() => setDialogoAbierto(false)}
      />
    </PaginaConEncabezado>
  )
}
