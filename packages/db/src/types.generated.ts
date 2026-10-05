export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      agent_runs: {
        Row: {
          applied_at: string | null;
          assistant_summary: string | null;
          confirmed_at: string | null;
          created_at: string;
          id: string;
          input_message: string;
          llm_model: string;
          source: string;
          status: string;
          user_id: string;
        };
        Insert: {
          applied_at?: string | null;
          assistant_summary?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          id?: string;
          input_message: string;
          llm_model: string;
          source: string;
          status?: string;
          user_id: string;
        };
        Update: {
          applied_at?: string | null;
          assistant_summary?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
          id?: string;
          input_message?: string;
          llm_model?: string;
          source?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      change_set_items: {
        Row: {
          action: string;
          applied_at: string | null;
          created_at: string;
          diff_summary: string;
          error: string | null;
          id: string;
          payload: NonNullable<Json>;
          run_id: string;
          status: string;
          target: string;
          target_id: string | null;
        };
        Insert: {
          action: string;
          applied_at?: string | null;
          created_at?: string;
          diff_summary: string;
          error?: string | null;
          id?: string;
          payload: NonNullable<Json>;
          run_id: string;
          status?: string;
          target: string;
          target_id?: string | null;
        };
        Update: {
          action?: string;
          applied_at?: string | null;
          created_at?: string;
          diff_summary?: string;
          error?: string | null;
          id?: string;
          payload?: NonNullable<Json>;
          run_id?: string;
          status?: string;
          target?: string;
          target_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "change_set_items_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      cli_tokens: {
        Row: {
          created_at: string;
          expires_at: string | null;
          id: string;
          last_used_at: string | null;
          name: string;
          revoked_at: string | null;
          token_hash: string;
          token_prefix: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          last_used_at?: string | null;
          name: string;
          revoked_at?: string | null;
          token_hash: string;
          token_prefix: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          last_used_at?: string | null;
          name?: string;
          revoked_at?: string | null;
          token_hash?: string;
          token_prefix?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cli_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      connected_accounts: {
        Row: {
          access_token_secret_id: string;
          connected_at: string;
          id: string;
          provider: string;
          provider_user_id: string;
          provider_username: string | null;
          refresh_token_secret_id: string | null;
          revoked_at: string | null;
          scopes: string[];
          token_expires_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_token_secret_id: string;
          connected_at?: string;
          id?: string;
          provider: string;
          provider_user_id: string;
          provider_username?: string | null;
          refresh_token_secret_id?: string | null;
          revoked_at?: string | null;
          scopes?: string[];
          token_expires_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_token_secret_id?: string;
          connected_at?: string;
          id?: string;
          provider?: string;
          provider_user_id?: string;
          provider_username?: string | null;
          refresh_token_secret_id?: string | null;
          revoked_at?: string | null;
          scopes?: string[];
          token_expires_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connected_accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      llm_api_keys: {
        Row: {
          api_key_secret_id: string;
          created_at: string;
          id: string;
          provider: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          api_key_secret_id: string;
          created_at?: string;
          id?: string;
          provider?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          api_key_secret_id?: string;
          created_at?: string;
          id?: string;
          provider?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "llm_api_keys_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          contact_email: string | null;
          created_at: string;
          full_name: string;
          headline: string | null;
          id: string;
          location: string | null;
          portfolio_theme: string;
          portfolio_visibility: string;
          slug: string;
          theme_config: NonNullable<Json>;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          contact_email?: string | null;
          created_at?: string;
          full_name?: string;
          headline?: string | null;
          id: string;
          location?: string | null;
          portfolio_theme?: string;
          portfolio_visibility?: string;
          slug: string;
          theme_config?: NonNullable<Json>;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          contact_email?: string | null;
          created_at?: string;
          full_name?: string;
          headline?: string | null;
          id?: string;
          location?: string | null;
          portfolio_theme?: string;
          portfolio_visibility?: string;
          slug?: string;
          theme_config?: NonNullable<Json>;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          end_date: string | null;
          highlights: string[];
          id: string;
          is_current: boolean;
          links: NonNullable<Json>;
          name: string;
          role: string | null;
          slug: string;
          start_date: string | null;
          summary: string | null;
          tech_stack: string[];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          end_date?: string | null;
          highlights?: string[];
          id?: string;
          is_current?: boolean;
          links?: NonNullable<Json>;
          name: string;
          role?: string | null;
          slug: string;
          start_date?: string | null;
          summary?: string | null;
          tech_stack?: string[];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          end_date?: string | null;
          highlights?: string[];
          id?: string;
          is_current?: boolean;
          links?: NonNullable<Json>;
          name?: string;
          role?: string | null;
          slug?: string;
          start_date?: string | null;
          summary?: string | null;
          tech_stack?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      resume_versions: {
        Row: {
          created_at: string;
          data_snapshot: NonNullable<Json>;
          generated_by_run_id: string | null;
          id: string;
          is_active: boolean;
          pdf_storage_path: string;
          template_id: string;
          user_id: string;
          version_number: number;
        };
        Insert: {
          created_at?: string;
          data_snapshot: NonNullable<Json>;
          generated_by_run_id?: string | null;
          id?: string;
          is_active?: boolean;
          pdf_storage_path: string;
          template_id?: string;
          user_id: string;
          version_number: number;
        };
        Update: {
          created_at?: string;
          data_snapshot?: NonNullable<Json>;
          generated_by_run_id?: string | null;
          id?: string;
          is_active?: boolean;
          pdf_storage_path?: string;
          template_id?: string;
          user_id?: string;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "resume_versions_run_fk";
            columns: ["generated_by_run_id"];
            isOneToOne: false;
            referencedRelation: "agent_runs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resume_versions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          category: string;
          created_at: string;
          display_order: number;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "skills_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      work_history: {
        Row: {
          company: string;
          created_at: string;
          description: string | null;
          display_order: number;
          end_date: string | null;
          highlights: string[];
          id: string;
          is_current: boolean;
          location: string | null;
          start_date: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          company: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          end_date?: string | null;
          highlights?: string[];
          id?: string;
          is_current?: boolean;
          location?: string | null;
          start_date: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          company?: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          end_date?: string | null;
          highlights?: string[];
          id?: string;
          is_current?: boolean;
          location?: string | null;
          start_date?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      disconnect_connected_account: {
        Args: { p_provider: string; p_user_id: string };
        Returns: undefined;
      };
      get_decrypted_connected_account_token: {
        Args: { p_provider: string; p_user_id: string };
        Returns: {
          access_token: string;
          provider_username: string;
        }[];
      };
      get_decrypted_llm_api_key: {
        Args: { p_provider?: string; p_user_id: string };
        Returns: string;
      };
      get_portfolio_by_slug: { Args: { p_slug: string }; Returns: Json };
      has_llm_api_key: { Args: { p_provider?: string; p_user_id: string }; Returns: boolean };
      set_connected_account_token: {
        Args: {
          p_access_token: string;
          p_provider: string;
          p_provider_user_id: string;
          p_provider_username: string;
          p_scopes: string[];
          p_user_id: string;
        };
        Returns: undefined;
      };
      set_llm_api_key: {
        Args: { p_api_key: string; p_provider: string; p_user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
