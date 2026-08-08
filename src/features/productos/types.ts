import { type Database } from "@/integrations/supabase/types"

/** Fila de la tabla productos, tipada desde los tipos generados de Supabase. */
export type Producto = Database["public"]["Tables"]["productos"]["Row"]
