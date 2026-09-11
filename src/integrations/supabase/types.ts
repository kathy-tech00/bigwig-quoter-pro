export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      clients: {
        Row: {
          company_name: string;
          created_at: string;
          email: string;
          id: string;
          name: string;
          owner_id: string;
          phone: string;
          project_address: string;
          updated_at: string;
        };
        Insert: {
          company_name?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name: string;
          owner_id: string;
          phone?: string;
          project_address?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          phone?: string;
          project_address?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_settings: {
        Row: {
          address: string;
          company_name: string;
          created_at: string;
          default_exchange_rate: number;
          default_expiry_days: number;
          email: string;
          id: string;
          invoice_prefix: string;
          ngn_bank: Json;
          owner_id: string;
          phone: string;
          quote_prefix: string;
          registration_number: string;
          signatory_name: string;
          signatory_position: string;
          tagline: string;
          updated_at: string;
          usd_bank: Json;
          website: string;
        };
        Insert: {
          address?: string;
          company_name: string;
          created_at?: string;
          default_exchange_rate?: number;
          default_expiry_days?: number;
          email?: string;
          id?: string;
          invoice_prefix?: string;
          ngn_bank?: Json;
          owner_id: string;
          phone?: string;
          quote_prefix?: string;
          registration_number?: string;
          signatory_name?: string;
          signatory_position?: string;
          tagline?: string;
          updated_at?: string;
          usd_bank?: Json;
          website?: string;
        };
        Update: {
          address?: string;
          company_name?: string;
          created_at?: string;
          default_exchange_rate?: number;
          default_expiry_days?: number;
          email?: string;
          id?: string;
          invoice_prefix?: string;
          ngn_bank?: Json;
          owner_id?: string;
          phone?: string;
          quote_prefix?: string;
          registration_number?: string;
          signatory_name?: string;
          signatory_position?: string;
          tagline?: string;
          updated_at?: string;
          usd_bank?: Json;
          website?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          client_id: string | null;
          created_at: string;
          currency: string;
          due_date: string;
          exchange_rate: number;
          id: string;
          invoice_number: string;
          issue_date: string;
          owner_id: string;
          paid_minor: number;
          quotation_id: string | null;
          status: Database["public"]["Enums"]["invoice_status"];
          total_minor: number;
          updated_at: string;
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          currency: string;
          due_date: string;
          exchange_rate: number;
          id?: string;
          invoice_number: string;
          issue_date?: string;
          owner_id: string;
          paid_minor?: number;
          quotation_id?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          total_minor: number;
          updated_at?: string;
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          currency?: string;
          due_date?: string;
          exchange_rate?: number;
          id?: string;
          invoice_number?: string;
          issue_date?: string;
          owner_id?: string;
          paid_minor?: number;
          quotation_id?: string | null;
          status?: Database["public"]["Enums"]["invoice_status"];
          total_minor?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey";
            columns: ["quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount_minor: number;
          created_at: string;
          currency: string;
          id: string;
          invoice_id: string;
          method: string;
          notes: string;
          owner_id: string;
          paid_at: string;
          reference: string;
        };
        Insert: {
          amount_minor: number;
          created_at?: string;
          currency: string;
          id?: string;
          invoice_id: string;
          method?: string;
          notes?: string;
          owner_id: string;
          paid_at?: string;
          reference?: string;
        };
        Update: {
          amount_minor?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          invoice_id?: string;
          method?: string;
          notes?: string;
          owner_id?: string;
          paid_at?: string;
          reference?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
        ];
      };
      quotation_items: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          position: number;
          quantity: number;
          quotation_id: string;
          rate_minor: number;
          unit: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          position?: number;
          quantity: number;
          quotation_id: string;
          rate_minor: number;
          unit?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          position?: number;
          quantity?: number;
          quotation_id?: string;
          rate_minor?: number;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey";
            columns: ["quotation_id"];
            isOneToOne: false;
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          },
        ];
      };
      quotations: {
        Row: {
          accepted_at: string | null;
          client_id: string | null;
          created_at: string;
          currency: string;
          deposit_minor: number;
          discount_minor: number;
          exchange_rate: number;
          expiry_date: string;
          grand_total_minor: number;
          id: string;
          issue_date: string;
          notes: string;
          owner_id: string;
          project_address: string;
          public_token: string;
          quotation_number: string;
          rejected_at: string | null;
          signature_data: string | null;
          signature_name: string | null;
          status: Database["public"]["Enums"]["quotation_status"];
          subtotal_minor: number;
          tax_minor: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          client_id?: string | null;
          created_at?: string;
          currency?: string;
          deposit_minor?: number;
          discount_minor?: number;
          exchange_rate: number;
          expiry_date: string;
          grand_total_minor?: number;
          id?: string;
          issue_date?: string;
          notes?: string;
          owner_id: string;
          project_address?: string;
          public_token?: string;
          quotation_number: string;
          rejected_at?: string | null;
          signature_data?: string | null;
          signature_name?: string | null;
          status?: Database["public"]["Enums"]["quotation_status"];
          subtotal_minor?: number;
          tax_minor?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          client_id?: string | null;
          created_at?: string;
          currency?: string;
          deposit_minor?: number;
          discount_minor?: number;
          exchange_rate?: number;
          expiry_date?: string;
          grand_total_minor?: number;
          id?: string;
          issue_date?: string;
          notes?: string;
          owner_id?: string;
          project_address?: string;
          public_token?: string;
          quotation_number?: string;
          rejected_at?: string | null;
          signature_data?: string | null;
          signature_name?: string | null;
          status?: Database["public"]["Enums"]["quotation_status"];
          subtotal_minor?: number;
          tax_minor?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin";
      invoice_status: "unpaid" | "partially_paid" | "paid" | "overdue";
      quotation_status:
        "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired" | "invoiced";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      invoice_status: ["unpaid", "partially_paid", "paid", "overdue"],
      quotation_status: ["draft", "sent", "viewed", "accepted", "rejected", "expired", "invoiced"],
    },
  },
} as const;
