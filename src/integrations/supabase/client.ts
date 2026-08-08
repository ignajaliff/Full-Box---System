import { createClient } from "@supabase/supabase-js"

import { type Database } from "@/integrations/supabase/types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Copiá .env.example a .env y completalas."
  )
}

/**
 * Único punto de acceso a Supabase en todo el proyecto.
 * Nunca crear instancias adicionales del cliente en otros archivos.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
