export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          full_name: string | null;
          role: string | null;
          avatar_url: string | null;
          current_belt: string | null;
          belt_degree: number | null;
          birth_date: string | null;
          sex: string | null;
          federation_number: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          current_belt?: string | null;
          belt_degree?: number | null;
          birth_date?: string | null;
          sex?: string | null;
          federation_number?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          current_belt?: string | null;
          belt_degree?: number | null;
          birth_date?: string | null;
          sex?: string | null;
          federation_number?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      academies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          city: string | null;
          invite_code: string;
          logo_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          city?: string | null;
          invite_code: string;
          logo_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          city?: string | null;
          invite_code?: string;
          logo_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      academy_members: {
        Row: {
          academy_id: string;
          user_id: string;
          joined_at: string | null;
        };
        Insert: {
          academy_id: string;
          user_id: string;
          joined_at?: string | null;
        };
        Update: {
          academy_id?: string;
          user_id?: string;
          joined_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "academy_members_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academy_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      academy_staff: {
        Row: {
          academy_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["academy_staff_role"];
          created_at: string | null;
        };
        Insert: {
          academy_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["academy_staff_role"];
          created_at?: string | null;
        };
        Update: {
          academy_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["academy_staff_role"];
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "academy_staff_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academy_staff_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number | null;
          currency: string | null;
          max_students: number | null;
          max_professors: number | null;
          max_locations: number | null;
          features: Json;
          is_active: boolean | null;
          stripe_price_id_monthly: string | null;
          stripe_price_id_yearly: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_monthly: number;
          price_yearly?: number | null;
          currency?: string | null;
          max_students?: number | null;
          max_professors?: number | null;
          max_locations?: number | null;
          features?: Json;
          is_active?: boolean | null;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number | null;
          currency?: string | null;
          max_students?: number | null;
          max_professors?: number | null;
          max_locations?: number | null;
          features?: Json;
          is_active?: boolean | null;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          academy_id: string;
          plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_start_date: string | null;
          trial_end_date: string | null;
          payment_gateway: Database["public"]["Enums"]["payment_gateway"] | null;
          pix_authorization_id: string | null;
          pix_recurrence_id: string | null;
          pix_customer_cpf: string | null;
          pix_customer_name: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          canceled_at: string | null;
          cancel_at_period_end: boolean | null;
          cancel_reason: string | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          plan_id: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          payment_gateway?: Database["public"]["Enums"]["payment_gateway"] | null;
          pix_authorization_id?: string | null;
          pix_recurrence_id?: string | null;
          pix_customer_cpf?: string | null;
          pix_customer_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          canceled_at?: string | null;
          cancel_at_period_end?: boolean | null;
          cancel_reason?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          plan_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_start_date?: string | null;
          trial_end_date?: string | null;
          payment_gateway?: Database["public"]["Enums"]["payment_gateway"] | null;
          pix_authorization_id?: string | null;
          pix_recurrence_id?: string | null;
          pix_customer_cpf?: string | null;
          pix_customer_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          canceled_at?: string | null;
          cancel_at_period_end?: boolean | null;
          cancel_reason?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_history: {
        Row: {
          id: string;
          subscription_id: string;
          academy_id: string;
          amount: number;
          currency: string | null;
          payment_gateway: Database["public"]["Enums"]["payment_gateway"];
          gateway_payment_id: string | null;
          gateway_charge_id: string | null;
          gateway_invoice_id: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          payment_method: string | null;
          failure_reason: string | null;
          failure_code: string | null;
          period_start: string | null;
          period_end: string | null;
          paid_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          academy_id: string;
          amount: number;
          currency?: string | null;
          payment_gateway: Database["public"]["Enums"]["payment_gateway"];
          gateway_payment_id?: string | null;
          gateway_charge_id?: string | null;
          gateway_invoice_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          payment_method?: string | null;
          failure_reason?: string | null;
          failure_code?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          paid_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          academy_id?: string;
          amount?: number;
          currency?: string | null;
          payment_gateway?: Database["public"]["Enums"]["payment_gateway"];
          gateway_payment_id?: string | null;
          gateway_charge_id?: string | null;
          gateway_invoice_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          payment_method?: string | null;
          failure_reason?: string | null;
          failure_code?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          paid_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_history_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          }
        ];
      };
      webhook_events: {
        Row: {
          id: string;
          gateway: string;
          event_id: string;
          event_type: string;
          payload: Json;
          headers: Json | null;
          status: Database["public"]["Enums"]["webhook_status"];
          processed_at: string | null;
          error_message: string | null;
          retry_count: number | null;
          next_retry_at: string | null;
          received_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          gateway: string;
          event_id: string;
          event_type: string;
          payload: Json;
          headers?: Json | null;
          status?: Database["public"]["Enums"]["webhook_status"];
          processed_at?: string | null;
          error_message?: string | null;
          retry_count?: number | null;
          next_retry_at?: string | null;
          received_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          gateway?: string;
          event_id?: string;
          event_type?: string;
          payload?: Json;
          headers?: Json | null;
          status?: Database["public"]["Enums"]["webhook_status"];
          processed_at?: string | null;
          error_message?: string | null;
          retry_count?: number | null;
          next_retry_at?: string | null;
          received_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      academy_class_schedule: {
        Row: {
          id: string;
          academy_id: string;
          title: string;
          instructor_id: string | null;
          instructor_name: string | null;
          weekday: number;
          start_time: string;
          end_time: string;
          location: string | null;
          level: string | null;
          notes: string | null;
          is_recurring: boolean | null;
          start_date: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          title: string;
          instructor_id?: string | null;
          instructor_name?: string | null;
          weekday: number;
          start_time: string;
          end_time: string;
          location?: string | null;
          level?: string | null;
          notes?: string | null;
          is_recurring?: boolean | null;
          start_date?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          title?: string;
          instructor_id?: string | null;
          instructor_name?: string | null;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          level?: string | null;
          notes?: string | null;
          is_recurring?: boolean | null;
          start_date?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "academy_class_schedule_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          }
          ,
          {
            foreignKeyName: "academy_class_schedule_instructor_id_fkey";
            columns: ["instructor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      class_checkins: {
        Row: {
          id: string;
          academy_id: string;
          class_id: string;
          student_id: string;
          status: "pending" | "approved" | "rejected";
          validated_by: string | null;
          validated_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          class_id: string;
          student_id: string;
          status?: "pending" | "approved" | "rejected";
          validated_by?: string | null;
          validated_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          class_id?: string;
          student_id?: string;
          status?: "pending" | "approved" | "rejected";
          validated_by?: string | null;
          validated_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "class_checkins_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_checkins_class_id_fkey";
            columns: ["class_id"];
            referencedRelation: "academy_class_schedule";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_checkins_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_checkins_validated_by_fkey";
            columns: ["validated_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      student_progress: {
        Row: {
          student_id: string;
          academy_id: string;
          approved_classes_count: number;
          updated_at: string | null;
        };
        Insert: {
          student_id: string;
          academy_id: string;
          approved_classes_count?: number;
          updated_at?: string | null;
        };
        Update: {
          student_id?: string;
          academy_id?: string;
          approved_classes_count?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_progress_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_progress_student_id_fkey";
            columns: ["student_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      add_professor_to_academy: {
        Args: {
          p_academy_id: string;
          p_email: string;
        };
        Returns: string;
      };
      get_academy_by_invite_code: {
        Args: {
          p_code: string;
        };
        Returns: {
          id: string;
          owner_id: string;
          name: string;
          city: string | null;
          invite_code: string;
          logo_url: string | null;
          created_at: string | null;
        }[];
      };
    };
    Enums: {
      academy_staff_role: "owner" | "professor";
      subscription_status: "trialing" | "active" | "past_due" | "canceled" | "expired";
      payment_gateway: "pix_auto" | "stripe";
      payment_status: "pending" | "processing" | "succeeded" | "failed" | "refunded";
      webhook_status: "pending" | "processing" | "processed" | "failed" | "skipped";
      user_role: "owner" | "professor" | "student";
    };
    CompositeTypes: {};
  };
};
