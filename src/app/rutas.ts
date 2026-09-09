/**
 * Rutas del sistema en un solo lugar, para no repetir strings sueltos.
 * Al crear un módulo nuevo, agregar su ruta acá.
 */
export const RUTA_LOGIN = "/auth/login"

export const RUTA_DASHBOARD = "/dashboard"

export const RUTA_PRODUCTOS = "/productos"

export const RUTA_CLIENTES = "/clientes"

export const RUTA_REMITOS = "/remitos"

export const RUTA_FINANZAS = "/finanzas"

/**
 * Subpáginas de Finanzas. Entrar a `/finanzas` redirige a la primera
 * (historial), que es la vista de consulta habitual.
 */
export const RUTA_FINANZAS_HISTORIAL = "/finanzas/historial"

export const RUTA_FINANZAS_PENDIENTES = "/finanzas/pendientes"

/** Destino después de un login exitoso. */
export const RUTA_INICIO = RUTA_DASHBOARD
