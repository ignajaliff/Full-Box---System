export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          condicion_iva: string | null
          created_at: string
          cuit: string | null
          direccion_entrega: string | null
          email: string | null
          id: string
          razon_social: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          condicion_iva?: string | null
          created_at?: string
          cuit?: string | null
          direccion_entrega?: string | null
          email?: string | null
          id?: string
          razon_social: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          condicion_iva?: string | null
          created_at?: string
          cuit?: string | null
          direccion_entrega?: string | null
          email?: string | null
          id?: string
          razon_social?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cobros: {
        Row: {
          cliente_id: string
          created_at: string
          fecha: string
          id: string
          metodo: string
          notas: string | null
          nro_factura: string | null
          numero: number
          total: number
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          fecha?: string
          id?: string
          metodo: string
          notas?: string | null
          nro_factura?: string | null
          numero?: never
          total: number
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          fecha?: string
          id?: string
          metodo?: string
          notas?: string | null
          nro_factura?: string | null
          numero?: never
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      items_remito: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          precio_unitario: number | null
          producto_id: string
          remito_id: string
          updated_at: string | null
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: string
          precio_unitario?: number | null
          producto_id: string
          remito_id: string
          updated_at?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          precio_unitario?: number | null
          producto_id?: string
          remito_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_remito_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_remito_remito_id_fkey"
            columns: ["remito_id"]
            isOneToOne: false
            referencedRelation: "remitos"
            referencedColumns: ["id"]
          },
        ]
      }
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
          tramos_precio: Json
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
          tramos_precio?: Json
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
          tramos_precio?: Json
          unidad_minima?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      remitos: {
        Row: {
          cliente_id: string
          cobro_id: string | null
          created_at: string
          estado: string
          id: string
          notas: string | null
          numero: number
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          cobro_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          notas?: string | null
          numero?: never
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          cobro_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          notas?: string | null
          numero?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remitos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remitos_cobro_id_fkey"
            columns: ["cobro_id"]
            isOneToOne: false
            referencedRelation: "cobros"
            referencedColumns: ["id"]
          },
        ]
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
      cobrar_remitos: {
        Args: {
          p_metodo: string
          p_notas?: string
          p_nro_factura?: string
          p_precios: Json
          p_remito_ids: string[]
        }
        Returns: string
      }
      crear_remito: {
        Args: { p_cliente_id: string; p_items: Json; p_notas?: string }
        Returns: string
      }
      editar_remito: {
        Args: {
          p_cliente_id: string
          p_items: Json
          p_notas?: string
          p_remito_id: string
        }
        Returns: undefined
      }
      fmt_cm: { Args: { v: number }; Returns: string }
      tiene_rol: { Args: { rol_requerido: string }; Returns: boolean }
      tramos_precio_validos: {
        Args: { tramos: Json; unidad_minima: number }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
