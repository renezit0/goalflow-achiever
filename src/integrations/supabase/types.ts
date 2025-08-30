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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      lojas: {
        Row: {
          created_at: string | null
          endereco: string | null
          id: number
          nome: string
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          endereco?: string | null
          id?: number
          nome: string
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          endereco?: string | null
          id?: number
          nome?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      metas: {
        Row: {
          categoria: string
          created_at: string | null
          id: number
          meta_mensal: number
          periodo_meta_id: number
          updated_at: string | null
          usuario_id: number
        }
        Insert: {
          categoria: string
          created_at?: string | null
          id?: number
          meta_mensal?: number
          periodo_meta_id: number
          updated_at?: string | null
          usuario_id: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          id?: number
          meta_mensal?: number
          periodo_meta_id?: number
          updated_at?: string | null
          usuario_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_periodo_meta_id_fkey"
            columns: ["periodo_meta_id"]
            isOneToOne: false
            referencedRelation: "periodos_meta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_loja: {
        Row: {
          created_at: string | null
          id: number
          loja_id: number
          meta_valor_total: number
          periodo_meta_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          loja_id: number
          meta_valor_total?: number
          periodo_meta_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          loja_id?: number
          meta_valor_total?: number
          periodo_meta_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_loja_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_loja_periodo_meta_id_fkey"
            columns: ["periodo_meta_id"]
            isOneToOne: false
            referencedRelation: "periodos_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_loja_categorias: {
        Row: {
          categoria: string
          id: number
          meta_loja_id: number
          meta_valor: number
        }
        Insert: {
          categoria: string
          id?: number
          meta_loja_id: number
          meta_valor?: number
        }
        Update: {
          categoria?: string
          id?: number
          meta_loja_id?: number
          meta_valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_loja_categorias_meta_loja_id_fkey"
            columns: ["meta_loja_id"]
            isOneToOne: false
            referencedRelation: "metas_loja"
            referencedColumns: ["id"]
          },
        ]
      }
      periodos_meta: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: number
          nome: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: number
          nome: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: number
          nome?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: number | null
          cpf: string | null
          created_at: string | null
          id: number
          login: string
          loja_id: number | null
          matricula: string | null
          nome: string
          permissao: number | null
          senha: string
          senha_provisoria: number | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: number | null
          cpf?: string | null
          created_at?: string | null
          id: number
          login: string
          loja_id?: number | null
          matricula?: string | null
          nome: string
          permissao?: number | null
          senha: string
          senha_provisoria?: number | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: number | null
          cpf?: string | null
          created_at?: string | null
          id?: number
          login?: string
          loja_id?: number | null
          matricula?: string | null
          nome?: string
          permissao?: number | null
          senha?: string
          senha_provisoria?: number | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          atualizado_por_usuario_id: number | null
          categoria: string
          data_atualizacao: string | null
          data_registro: string | null
          data_venda: string
          id: number
          registrado_por_usuario_id: number | null
          usuario_id: number
          valor_comissao: number
          valor_venda: number
        }
        Insert: {
          atualizado_por_usuario_id?: number | null
          categoria: string
          data_atualizacao?: string | null
          data_registro?: string | null
          data_venda: string
          id?: number
          registrado_por_usuario_id?: number | null
          usuario_id: number
          valor_comissao?: number
          valor_venda?: number
        }
        Update: {
          atualizado_por_usuario_id?: number | null
          categoria?: string
          data_atualizacao?: string | null
          data_registro?: string | null
          data_venda?: string
          id?: number
          registrado_por_usuario_id?: number | null
          usuario_id?: number
          valor_comissao?: number
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_atualizado_por_usuario_id_fkey"
            columns: ["atualizado_por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_registrado_por_usuario_id_fkey"
            columns: ["registrado_por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas_loja: {
        Row: {
          atualizado_por_usuario_id: number | null
          categoria: string
          data_atualizacao: string | null
          data_registro: string | null
          data_venda: string
          id: number
          loja_id: number
          registrado_por_usuario_id: number | null
          valor_venda: number
        }
        Insert: {
          atualizado_por_usuario_id?: number | null
          categoria: string
          data_atualizacao?: string | null
          data_registro?: string | null
          data_venda: string
          id?: number
          loja_id: number
          registrado_por_usuario_id?: number | null
          valor_venda?: number
        }
        Update: {
          atualizado_por_usuario_id?: number | null
          categoria?: string
          data_atualizacao?: string | null
          data_registro?: string | null
          data_venda?: string
          id?: number
          loja_id?: number
          registrado_por_usuario_id?: number | null
          valor_venda?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_loja_atualizado_por_usuario_id_fkey"
            columns: ["atualizado_por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_loja_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_loja_registrado_por_usuario_id_fkey"
            columns: ["registrado_por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
