export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      productos: {
        Row: {
          activo: boolean
          admite_impresion: boolean
          alto: number | null
          ancho: number | null
          categoria: string | null
          created_at: string
          desc_x100: number
          desc_x250: number
          desc_x500: number
          descripcion: string | null
          destacado: boolean
          id: string
          imagen_url: string | null
          largo: number | null
          medida: string
          nombre: string
          plazo_entrega: string | null
          precio: number | null
          slug: string | null
          tipo_carton: string | null
          unidad_minima: number
          updated_at: string | null
        }
        Insert: {
          activo?: boolean
          admite_impresion?: boolean
          alto?: number | null
          ancho?: number | null
          categoria?: string | null
          created_at?: string
          desc_x100?: number
          desc_x250?: number
          desc_x500?: number
          descripcion?: string | null
          destacado?: boolean
          id?: string
          imagen_url?: string | null
          largo?: number | null
          medida: string
          nombre: string
          plazo_entrega?: string | null
          precio?: number | null
          slug?: string | null
          tipo_carton?: string | null
          unidad_minima?: number
          updated_at?: string | null
        }
        Update: {
          activo?: boolean
          admite_impresion?: boolean
          alto?: number | null
          ancho?: number | null
          categoria?: string | null
          created_at?: string
          desc_x100?: number
          desc_x250?: number
          desc_x500?: number
          descripcion?: string | null
          destacado?: boolean
          id?: string
          imagen_url?: string | null
          largo?: number | null
          medida?: string
          nombre?: string
          plazo_entrega?: string | null
          precio?: number | null
          slug?: string | null
          tipo_carton?: string | null
          unidad_minima?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          nombre: string
          rol: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nombre: string
          rol: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          rol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fmt_cm: { Args: { v: number }; Returns: string }
      tiene_rol: { Args: { rol_requerido: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
