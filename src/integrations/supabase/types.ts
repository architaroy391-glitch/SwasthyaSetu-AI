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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      emergency_responses: {
        Row: {
          available_resource: string
          created_at: string
          distance_km: number
          emergency_id: string
          facility_id: string
          id: string
          is_demo: boolean
          responded_at: string | null
          status: Database["public"]["Enums"]["workflow_status"]
          travel_minutes: number
        }
        Insert: {
          available_resource: string
          created_at?: string
          distance_km: number
          emergency_id: string
          facility_id: string
          id?: string
          is_demo?: boolean
          responded_at?: string | null
          status?: Database["public"]["Enums"]["workflow_status"]
          travel_minutes: number
        }
        Update: {
          available_resource?: string
          created_at?: string
          distance_km?: number
          emergency_id?: string
          facility_id?: string
          id?: string
          is_demo?: boolean
          responded_at?: string | null
          status?: Database["public"]["Enums"]["workflow_status"]
          travel_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "emergency_responses_emergency_id_fkey"
            columns: ["emergency_id"]
            isOneToOne: false
            referencedRelation: "emergency_sos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_responses_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_sos: {
        Row: {
          created_at: string
          created_by: string | null
          emergency_type: string
          id: string
          is_demo: boolean
          latitude: number
          location_name: string
          longitude: number
          notes: string | null
          quantity: number
          reference_number: string
          required_resource: string
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string
          urgency: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          emergency_type: string
          id?: string
          is_demo?: boolean
          latitude: number
          location_name: string
          longitude: number
          notes?: string | null
          quantity?: number
          reference_number: string
          required_resource: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          urgency: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          emergency_type?: string
          id?: string
          is_demo?: boolean
          latitude?: number
          location_name?: string
          longitude?: number
          notes?: string | null
          quantity?: number
          reference_number?: string
          required_resource?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          available_beds: number
          created_at: string
          critical_medicines: number
          district: string
          doctors_available: number
          facility_type: string
          icu_beds: number
          id: string
          is_demo: boolean
          is_online: boolean
          last_synced_at: string
          latitude: number
          longitude: number
          name: string
          specialists_available: number
          state: string
          status: Database["public"]["Enums"]["facility_status"]
          updated_at: string
        }
        Insert: {
          available_beds?: number
          created_at?: string
          critical_medicines?: number
          district: string
          doctors_available?: number
          facility_type: string
          icu_beds?: number
          id?: string
          is_demo?: boolean
          is_online?: boolean
          last_synced_at?: string
          latitude: number
          longitude: number
          name: string
          specialists_available?: number
          state: string
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
        }
        Update: {
          available_beds?: number
          created_at?: string
          critical_medicines?: number
          district?: string
          doctors_available?: number
          facility_type?: string
          icu_beds?: number
          id?: string
          is_demo?: boolean
          is_online?: boolean
          last_synced_at?: string
          latitude?: number
          longitude?: number
          name?: string
          specialists_available?: number
          state?: string
          status?: Database["public"]["Enums"]["facility_status"]
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          batch_number: string | null
          created_at: string
          current_stock: number
          daily_usage: number
          expiry_date: string | null
          facility_id: string
          id: string
          is_demo: boolean
          last_updated_at: string
          medicine_id: string
          reorder_level: number
          sync_status: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          current_stock?: number
          daily_usage?: number
          expiry_date?: string | null
          facility_id: string
          id?: string
          is_demo?: boolean
          last_updated_at?: string
          medicine_id: string
          reorder_level?: number
          sync_status?: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          current_stock?: number
          daily_usage?: number
          expiry_date?: string | null
          facility_id?: string
          id?: string
          is_demo?: boolean
          last_updated_at?: string
          medicine_id?: string
          reorder_level?: number
          sync_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          name: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name: string
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          name?: string
          unit?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          facility_id: string | null
          id: string
          is_demo: boolean
          is_read: boolean
          notification_type: string
          priority: Database["public"]["Enums"]["risk_level"]
          recipient_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          facility_id?: string | null
          id?: string
          is_demo?: boolean
          is_read?: boolean
          notification_type: string
          priority?: Database["public"]["Enums"]["risk_level"]
          recipient_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          facility_id?: string | null
          id?: string
          is_demo?: boolean
          is_read?: boolean
          notification_type?: string
          priority?: Database["public"]["Enums"]["risk_level"]
          recipient_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          hospital_district: string | null
          hospital_id: string | null
          hospital_name: string | null
          hospital_state: string | null
          id: string
          id_card_path: string | null
          phone: string | null
          submitted_at: string | null
          updated_at: string
          verification_note: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hospital_district?: string | null
          hospital_id?: string | null
          hospital_name?: string | null
          hospital_state?: string | null
          id: string
          id_card_path?: string | null
          phone?: string | null
          submitted_at?: string | null
          updated_at?: string
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hospital_district?: string | null
          hospital_id?: string | null
          hospital_name?: string | null
          hospital_state?: string | null
          id?: string
          id_card_path?: string | null
          phone?: string | null
          submitted_at?: string | null
          updated_at?: string
          verification_note?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      redistribution_recommendations: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          destination_facility_id: string
          distance_km: number
          id: string
          is_demo: boolean
          quantity: number
          reason: string
          resource_name: string
          source_facility_id: string
          status: Database["public"]["Enums"]["workflow_status"]
          travel_minutes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          destination_facility_id: string
          distance_km: number
          id?: string
          is_demo?: boolean
          quantity: number
          reason: string
          resource_name: string
          source_facility_id: string
          status?: Database["public"]["Enums"]["workflow_status"]
          travel_minutes: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          destination_facility_id?: string
          distance_km?: number
          id?: string
          is_demo?: boolean
          quantity?: number
          reason?: string
          resource_name?: string
          source_facility_id?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          travel_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "redistribution_recommendations_destination_facility_id_fkey"
            columns: ["destination_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redistribution_recommendations_source_facility_id_fkey"
            columns: ["source_facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      shortage_predictions: {
        Row: {
          confidence: number
          contributing_factors: string[]
          created_at: string
          id: string
          inventory_item_id: string
          is_demo: boolean
          model_version: string
          predicted_at: string
          predicted_days_remaining: number
          risk: Database["public"]["Enums"]["risk_level"]
        }
        Insert: {
          confidence: number
          contributing_factors?: string[]
          created_at?: string
          id?: string
          inventory_item_id: string
          is_demo?: boolean
          model_version?: string
          predicted_at?: string
          predicted_days_remaining: number
          risk: Database["public"]["Enums"]["risk_level"]
        }
        Update: {
          confidence?: number
          contributing_factors?: string[]
          created_at?: string
          id?: string
          inventory_item_id?: string
          is_demo?: boolean
          model_version?: string
          predicted_at?: string
          predicted_days_remaining?: number
          risk?: Database["public"]["Enums"]["risk_level"]
        }
        Relationships: [
          {
            foreignKeyName: "shortage_predictions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role:
        | "PHC_STAFF"
        | "HOSPITAL_ADMIN"
        | "DISTRICT_ADMIN"
        | "EMERGENCY_COORDINATOR"
        | "STATE_ANALYST"
        | "SUPER_ADMIN"
      facility_status: "healthy" | "warning" | "critical" | "offline"
      risk_level: "critical" | "high" | "medium" | "low"
      verification_status:
        | "not_applicable"
        | "pending"
        | "verified"
        | "rejected"
        | "more_info"
      workflow_status:
        | "pending"
        | "approved"
        | "rejected"
        | "modified"
        | "active"
        | "responded"
        | "resolved"
        | "unavailable"
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
      app_role: [
        "PHC_STAFF",
        "HOSPITAL_ADMIN",
        "DISTRICT_ADMIN",
        "EMERGENCY_COORDINATOR",
        "STATE_ANALYST",
        "SUPER_ADMIN",
      ],
      facility_status: ["healthy", "warning", "critical", "offline"],
      risk_level: ["critical", "high", "medium", "low"],
      verification_status: [
        "not_applicable",
        "pending",
        "verified",
        "rejected",
        "more_info",
      ],
      workflow_status: [
        "pending",
        "approved",
        "rejected",
        "modified",
        "active",
        "responded",
        "resolved",
        "unavailable",
      ],
    },
  },
} as const
