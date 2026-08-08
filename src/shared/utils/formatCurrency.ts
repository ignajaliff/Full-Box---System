const formateador = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formato de moneda centralizado del sistema.
 * No repetir `toFixed(2)` suelto por el código (ver ai-pmp/rules.txt).
 */
export function formatCurrency(valor: number) {
  return formateador.format(valor)
}
