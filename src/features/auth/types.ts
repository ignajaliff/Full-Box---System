/**
 * Roles del sistema. Por ahora Full Box solo maneja "admin";
 * al sumar roles nuevos, actualizar también el CHECK de la tabla
 * user_roles en Supabase y la tabla de roles del CLAUDE.md.
 */
export const ROLES = ["admin"] as const

export type Rol = (typeof ROLES)[number]

export type UsuarioSesion = {
  id: string
  email: string
  nombre: string
  rol: Rol
}
