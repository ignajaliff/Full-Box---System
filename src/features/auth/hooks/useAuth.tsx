import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { type Session } from "@supabase/supabase-js"

import type { LoginInput } from "@/features/auth/schema"
import { ROLES, type Rol, type UsuarioSesion } from "@/features/auth/types"
import { supabase } from "@/integrations/supabase/client"

type AuthContextValue = {
  usuario: UsuarioSesion | null
  /** true mientras se resuelve la sesión inicial (evita parpadeo del login) */
  cargando: boolean
  estaAutenticado: boolean
  /**
   * Hay sesión de Supabase pero el usuario no tiene fila válida en user_roles:
   * autenticado pero NO autorizado. Sin esta señal quedaría en un bucle mudo
   * de vuelta al login.
   */
  sinAutorizacion: boolean
  tieneRol: (roles: Rol[]) => boolean
  iniciarSesion: (credenciales: LoginInput) => Promise<void>
  cerrarSesion: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function esRolValido(rol: string): rol is Rol {
  return (ROLES as readonly string[]).includes(rol)
}

/**
 * Lee el perfil del usuario desde user_roles. El RLS garantiza que solo
 * devuelve la fila propia. Si no hay fila (o el rol no es válido), se
 * devuelve null: autenticado pero sin autorización.
 */
async function obtenerPerfil(session: Session): Promise<UsuarioSesion | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id, nombre, rol")
    .eq("id", session.user.id)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) console.error(error)
    return null
  }

  if (!data || !esRolValido(data.rol)) return null

  return {
    id: data.id,
    email: session.user.email ?? "",
    nombre: data.nombre,
    rol: data.rol,
  }
}

/**
 * Proveedor de sesión del sistema. Es el único punto que conoce Supabase auth;
 * el resto del sistema consume useAuth() sin saber de dónde viene la sesión.
 *
 * El rol que se lee acá es solo UX — la autorización real es el RLS.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null)
  const [sinAutorizacion, setSinAutorizacion] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true

    async function sincronizar(session: Session | null) {
      const perfil = session ? await obtenerPerfil(session) : null
      if (!activo) return
      setUsuario(perfil)
      setSinAutorizacion(session !== null && perfil === null)
      setCargando(false)
    }

    // Sesión inicial (puede venir de localStorage tras recargar la página).
    void supabase.auth
      .getSession()
      .then(({ data }) => sincronizar(data.session))

    // Mantiene la sesión sincronizada: login, logout, refresh de token y
    // cambios hechos en otra pestaña.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      void sincronizar(session)
    })

    return () => {
      activo = false
      subscription.unsubscribe()
    }
  }, [])

  const iniciarSesion = useCallback(
    async ({ email, password }: LoginInput) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      // onAuthStateChange se encarga de cargar el perfil.
    },
    []
  )

  const cerrarSesion = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error && import.meta.env.DEV) console.error(error)
    setUsuario(null)
    setSinAutorizacion(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      estaAutenticado: usuario !== null,
      sinAutorizacion,
      tieneRol: (roles) => (usuario ? roles.includes(usuario.rol) : false),
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, cargando, sinAutorizacion, iniciarSesion, cerrarSesion]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>")
  }

  return context
}
