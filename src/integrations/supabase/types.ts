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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          app_name: string | null
          categories: Json | null
          currency: string | null
          id: string
          payment_methods: Json | null
        }
        Insert: {
          app_name?: string | null
          categories?: Json | null
          currency?: string | null
          id?: string
          payment_methods?: Json | null
        }
        Update: {
          app_name?: string | null
          categories?: Json | null
          currency?: string | null
          id?: string
          payment_methods?: Json | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          balance: number | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          shop_id: string
        }
        Insert: {
          address?: string | null
          balance?: number | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          shop_id: string
        }
        Update: {
          address?: string | null
          balance?: number | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          customer_id: string | null
          customer_name: string | null
          date: string | null
          discount: number | null
          id: string
          notes: string | null
          paid: number | null
          payment_method: string | null
          remaining: number | null
          shop_id: string
          subtotal: number | null
          total: number | null
          type: string
        }
        Insert: {
          customer_id?: string | null
          customer_name?: string | null
          date?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          paid?: number | null
          payment_method?: string | null
          remaining?: number | null
          shop_id: string
          subtotal?: number | null
          total?: number | null
          type: string
        }
        Update: {
          customer_id?: string | null
          customer_name?: string | null
          date?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          paid?: number | null
          payment_method?: string | null
          remaining?: number | null
          shop_id?: string
          subtotal?: number | null
          total?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          buy_price: number | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          imei: string | null
          min_stock: number | null
          name: string
          quantity: number | null
          sell_price: number | null
          shop_id: string
        }
        Insert: {
          barcode?: string | null
          buy_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          imei?: string | null
          min_stock?: number | null
          name: string
          quantity?: number | null
          sell_price?: number | null
          shop_id: string
        }
        Update: {
          barcode?: string | null
          buy_price?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          imei?: string | null
          min_stock?: number | null
          name?: string
          quantity?: number | null
          sell_price?: number | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_locks: {
        Row: {
          id: string
          lock_type: string
          password: string
          shop_id: string
        }
        Insert: {
          id?: string
          lock_type: string
          password: string
          shop_id: string
        }
        Update: {
          id?: string
          lock_type?: string
          password?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_locks_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_locks_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          active: boolean | null
          address: string | null
          created_at: string | null
          id: string
          name: string
          password: string
          phone: string | null
          username: string
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          id?: string
          name: string
          password: string
          phone?: string | null
          username: string
        }
        Update: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          id?: string
          name?: string
          password?: string
          phone?: string | null
          username?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          customer_id: string
          date: string | null
          id: string
          notes: string | null
          shop_id: string
          type: string
        }
        Insert: {
          amount?: number
          customer_id: string
          date?: string | null
          id?: string
          notes?: string | null
          shop_id: string
          type: string
        }
        Update: {
          amount?: number
          customer_id?: string
          date?: string | null
          id?: string
          notes?: string | null
          shop_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      shops_public: {
        Row: {
          active: boolean | null
          address: string | null
          created_at: string | null
          id: string | null
          name: string | null
          phone: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          phone?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      change_lock_password: {
        Args: {
          p_current_password: string
          p_lock_type: string
          p_new_password: string
          p_shop_id: string
        }
        Returns: boolean
      }
      has_lock: {
        Args: { p_lock_type: string; p_shop_id: string }
        Returns: boolean
      }
      verify_lock_password: {
        Args: { p_lock_type: string; p_password: string; p_shop_id: string }
        Returns: boolean
      }
      verify_shop_login: {
        Args: { p_password: string; p_username: string }
        Returns: {
          shop_active: boolean
          shop_address: string
          shop_id: string
          shop_name: string
          shop_phone: string
          shop_username: string
        }[]
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
