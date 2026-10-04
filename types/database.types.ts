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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          address: string | null
          bank_details: string | null
          business_name: string
          default_currency: string
          default_vat_rate: number
          email: string | null
          id: string
          invoice_prefix: string
          legal_name: string | null
          logo_path: string | null
          phone: string | null
          quotation_prefix: string
          terms_and_conditions: string | null
          trn: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: string | null
          business_name?: string
          default_currency?: string
          default_vat_rate?: number
          email?: string | null
          id?: string
          invoice_prefix?: string
          legal_name?: string | null
          logo_path?: string | null
          phone?: string | null
          quotation_prefix?: string
          terms_and_conditions?: string | null
          trn?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: string | null
          business_name?: string
          default_currency?: string
          default_vat_rate?: number
          email?: string | null
          id?: string
          invoice_prefix?: string
          legal_name?: string | null
          logo_path?: string | null
          phone?: string | null
          quotation_prefix?: string
          terms_and_conditions?: string | null
          trn?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          trn: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          trn?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          trn?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          authorized_signatory_email: string | null
          authorized_signatory_name: string | null
          authorized_signatory_title: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          city: string | null
          country: string
          created_at: string
          created_by: string | null
          default_currency: string
          default_vat_rate: number
          email: string | null
          emirate: string | null
          iban: string | null
          id: string
          invoice_footer: string | null
          legal_name: string
          logo_path: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          quotation_footer: string | null
          quotation_validity_days: number
          swift_code: string | null
          trading_name: string | null
          trn: string | null
          updated_at: string
          website: string | null
          workspace_id: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          authorized_signatory_email?: string | null
          authorized_signatory_name?: string | null
          authorized_signatory_title?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          default_currency?: string
          default_vat_rate?: number
          email?: string | null
          emirate?: string | null
          iban?: string | null
          id?: string
          invoice_footer?: string | null
          legal_name?: string
          logo_path?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          quotation_footer?: string | null
          quotation_validity_days?: number
          swift_code?: string | null
          trading_name?: string | null
          trn?: string | null
          updated_at?: string
          website?: string | null
          workspace_id?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          authorized_signatory_email?: string | null
          authorized_signatory_name?: string | null
          authorized_signatory_title?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          default_currency?: string
          default_vat_rate?: number
          email?: string | null
          emirate?: string | null
          iban?: string | null
          id?: string
          invoice_footer?: string | null
          legal_name?: string
          logo_path?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          quotation_footer?: string | null
          quotation_validity_days?: number
          swift_code?: string | null
          trading_name?: string | null
          trn?: string | null
          updated_at?: string
          website?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          credit_note_number: string
          id: string
          invoice_id: string
          issue_date: string
          reason: string
          status: string
          subtotal: number
          total: number
          vat_amount: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          credit_note_number: string
          id?: string
          invoice_id: string
          issue_date: string
          reason: string
          status?: string
          subtotal?: number
          total?: number
          vat_amount?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          credit_note_number?: string
          id?: string
          invoice_id?: string
          issue_date?: string
          reason?: string
          status?: string
          subtotal?: number
          total?: number
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          title: string
          updated_at: string
          uploaded_by: string
          workspace_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          title: string
          updated_at?: string
          uploaded_by: string
          workspace_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          created_by: string | null
          description: string
          expense_date: string
          id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          expense_date?: string
          id?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          custom_values: Json
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          unit_price: number
          vat_rate: number
        }
        Insert: {
          custom_values?: Json
          description: string
          id?: string
          invoice_id: string
          line_total?: number
          quantity?: number
          unit_price?: number
          vat_rate?: number
        }
        Update: {
          custom_values?: Json
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          unit_price?: number
          vat_rate?: number
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
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          provider: string | null
          provider_event_id: string | null
          provider_fee: number | null
          provider_payment_id: string | null
          raw_data: Json | null
          reference: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          provider?: string | null
          provider_event_id?: string | null
          provider_fee?: number | null
          provider_payment_id?: string | null
          raw_data?: Json | null
          reference?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          provider?: string | null
          provider_event_id?: string | null
          provider_fee?: number | null
          provider_payment_id?: string | null
          raw_data?: Json | null
          reference?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          custom_columns: Json
          discount: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_checkout_id: string | null
          payment_expires_at: string | null
          payment_provider: string | null
          payment_url: string | null
          pdf_path: string | null
          quotation_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          total: number
          updated_at: string
          vat_amount: number
          workspace_id: string
        }
        Insert: {
          amount_paid?: number
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_columns?: Json
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          payment_checkout_id?: string | null
          payment_expires_at?: string | null
          payment_provider?: string | null
          payment_url?: string | null
          pdf_path?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
          workspace_id: string
        }
        Update: {
          amount_paid?: number
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_columns?: Json
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          payment_checkout_id?: string | null
          payment_expires_at?: string | null
          payment_provider?: string | null
          payment_url?: string | null
          pdf_path?: string | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      member_permissions: {
        Row: {
          created_at: string
          permission_key: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          permission_key: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          permission_key?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_permissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          invoice_id: string
          method: string
          notes: string | null
          payment_date: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          invoice_id: string
          method: string
          notes?: string | null
          payment_date: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          payment_date?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          custom_values: Json
          description: string
          id: string
          line_total: number
          quantity: number
          quotation_id: string
          unit_price: number
          vat_rate: number
        }
        Insert: {
          custom_values?: Json
          description: string
          id?: string
          line_total?: number
          quantity?: number
          quotation_id: string
          unit_price?: number
          vat_rate?: number
        }
        Update: {
          custom_values?: Json
          description?: string
          id?: string
          line_total?: number
          quantity?: number
          quotation_id?: string
          unit_price?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          custom_columns: Json
          discount: number
          id: string
          issue_date: string
          notes: string | null
          pdf_path: string | null
          quotation_number: string
          status: Database["public"]["Enums"]["quotation_status"]
          subtotal: number
          total: number
          updated_at: string
          valid_until: string | null
          vat_amount: number
          workspace_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_columns?: Json
          discount?: number
          id?: string
          issue_date?: string
          notes?: string | null
          pdf_path?: string | null
          quotation_number: string
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          workspace_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          custom_columns?: Json
          discount?: number
          id?: string
          issue_date?: string
          notes?: string | null
          pdf_path?: string | null
          quotation_number?: string
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_amount?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: []
      }
      workspace_permissions: {
        Row: {
          created_at: string
          id: string
          permission_key: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_key: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_key?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_permissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          address: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_company_settings: {
        Args: { p_user_id?: string; p_workspace_id: string }
        Returns: boolean
      }
      can_manage_members: {
        Args: { p_user_id?: string; p_workspace_id: string }
        Returns: boolean
      }
      can_access_private_file: {
        Args: { p_name: string; p_write: boolean }
        Returns: boolean
      }
      can_manage_workspace: {
        Args: { p_user_id?: string; p_workspace_id: string }
        Returns: boolean
      }
      get_document_business_details: {
        Args: { p_workspace_id: string }
        Returns: {
          legal_name: string
          trading_name: string
          email: string
          phone: string
          website: string
          address_line_1: string
          address_line_2: string
          city: string
          emirate: string
          postal_code: string
          country: string
          trn: string
          default_currency: string
          default_vat_rate: number
          quotation_validity_days: number
          bank_name: string
          bank_account_name: string
          bank_account_number: string
          iban: string
          swift_code: string
          payment_terms: string
          invoice_footer: string
          quotation_footer: string
          authorized_signatory_name: string
          authorized_signatory_title: string
          logo_path: string
          brand_primary_color: string
          brand_secondary_color: string
        }[]
      }
      get_my_workspace_ids: { Args: never; Returns: string[] }
      get_workspace_role: {
        Args: { p_user_id?: string; p_workspace_id: string }
        Returns: string
      }
      has_workspace_role: {
        Args: { p_roles: string[]; p_workspace_id: string }
        Returns: boolean
      }
      is_any_workspace_role: { Args: { p_roles: string[] }; Returns: boolean }
      is_workspace_admin: {
        Args: { requested_workspace_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { requested_workspace_id: string }
        Returns: boolean
      }
      next_invoice_number: { Args: never; Returns: string }
      next_quotation_number: { Args: never; Returns: string }
      shares_workspace_with: { Args: { p_user_id: string }; Returns: boolean }
      refresh_invoice_payment_status: {
        Args: { p_invoice_id: string }
        Returns: {
          amount_paid: number
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          custom_columns: Json
          discount: number
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_checkout_id: string | null
          payment_expires_at: string | null
          payment_provider: string | null
          payment_url: string | null
          pdf_path: string | null
          quotation_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          total: number
          updated_at: string
          vat_amount: number
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_workspace_member: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: undefined
      }
      replace_member_permissions: {
        Args: {
          p_permissions: string[]
          p_user_id: string
          p_workspace_id: string
        }
        Returns: {
          created_at: string
          permission_key: string
          user_id: string
          workspace_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "member_permissions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_workspace_member_role: {
        Args: { p_role: string; p_user_id: string; p_workspace_id: string }
        Returns: {
          created_at: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        SetofOptions: {
          from: "*"
          to: "workspace_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "owner" | "partner"
      invoice_status:
        | "draft"
        | "sent"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "cancelled"
      quotation_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "converted"
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
    Enums: {
      app_role: ["owner", "partner"],
      invoice_status: [
        "draft",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ],
      quotation_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "converted",
      ],
    },
  },
} as const
