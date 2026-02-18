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
          first_name: string;
          birth_date: string | null;
          photo_url: string | null;
          sex: string | null;
          federation_number: string | null;
          belt: string;
          belt_degree: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          birth_date?: string | null;
          photo_url?: string | null;
          sex?: string | null;
          federation_number?: string | null;
          belt?: string;
          belt_degree?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          birth_date?: string | null;
          photo_url?: string | null;
          sex?: string | null;
          federation_number?: string | null;
          belt?: string;
          belt_degree?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      academies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          city: string | null;
          invite_code: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          city?: string | null;
          invite_code: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          city?: string | null;
          invite_code?: string;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academies_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      academy_members: {
        Row: {
          id: string;
          academy_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["member_role"];
          is_bjj: boolean;
          is_muay_thai: boolean;
          approved_classes: number;
          classes_to_degree: number;
          classes_to_belt: number;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["member_role"];
          is_bjj?: boolean;
          is_muay_thai?: boolean;
          approved_classes?: number;
          classes_to_degree?: number;
          classes_to_belt?: number;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["member_role"];
          is_bjj?: boolean;
          is_muay_thai?: boolean;
          approved_classes?: number;
          classes_to_degree?: number;
          classes_to_belt?: number;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
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
      academy_class_schedule: {
        Row: {
          id: string;
          academy_id: string;
          class_name: string;
          instructor_member_id: string | null;
          weekday: number;
          start_time: string;
          end_time: string;
          location: string | null;
          class_type: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          class_name: string;
          instructor_member_id?: string | null;
          weekday: number;
          start_time: string;
          end_time: string;
          location?: string | null;
          class_type?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          class_name?: string;
          instructor_member_id?: string | null;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          class_type?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academy_class_schedule_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academy_class_schedule_instructor_member_id_fkey";
            columns: ["instructor_member_id"];
            referencedRelation: "academy_members";
            referencedColumns: ["id"];
          }
        ];
      };
      class_checkins: {
        Row: {
          id: string;
          academy_id: string;
          class_id: string;
          member_id: string;
          training_date: string;
          status: Database["public"]["Enums"]["checkin_status"];
          approved_by_member_id: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          class_id: string;
          member_id: string;
          training_date?: string;
          status?: Database["public"]["Enums"]["checkin_status"];
          approved_by_member_id?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          class_id?: string;
          member_id?: string;
          training_date?: string;
          status?: Database["public"]["Enums"]["checkin_status"];
          approved_by_member_id?: string | null;
          approved_at?: string | null;
          created_at?: string;
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
            foreignKeyName: "class_checkins_member_id_fkey";
            columns: ["member_id"];
            referencedRelation: "academy_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_checkins_approved_by_member_id_fkey";
            columns: ["approved_by_member_id"];
            referencedRelation: "academy_members";
            referencedColumns: ["id"];
          }
        ];
      };
      platform_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price_month_cents: number;
          price_year_cents: number | null;
          discount_percent: number | null;
          description: string | null;
          currency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price_month_cents: number;
          price_year_cents?: number | null;
          discount_percent?: number | null;
          description?: string | null;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          price_month_cents?: number;
          price_year_cents?: number | null;
          discount_percent?: number | null;
          description?: string | null;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      academy_plans: {
        Row: {
          id: string;
          academy_id: string;
          name: string;
          price_cents: number;
          periodicity: Database["public"]["Enums"]["plan_periodicity"];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          name: string;
          price_cents: number;
          periodicity: Database["public"]["Enums"]["plan_periodicity"];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          name?: string;
          price_cents?: number;
          periodicity?: Database["public"]["Enums"]["plan_periodicity"];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academy_plans_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          }
        ];
      };
      academy_subscriptions: {
        Row: {
          id: string;
          academy_id: string;
          platform_plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          gateway: Database["public"]["Enums"]["payment_gateway"] | null;
          current_period_start: string | null;
          current_period_end: string | null;
          next_billing_at: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          platform_plan_id: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          gateway?: Database["public"]["Enums"]["payment_gateway"] | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          next_billing_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          platform_plan_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          gateway?: Database["public"]["Enums"]["payment_gateway"] | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          next_billing_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "academy_subscriptions_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "academy_subscriptions_platform_plan_id_fkey";
            columns: ["platform_plan_id"];
            referencedRelation: "platform_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      member_subscriptions: {
        Row: {
          id: string;
          academy_id: string;
          member_id: string;
          academy_plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          subscribed_at: string;
          current_period_start: string | null;
          current_period_end: string | null;
          next_billing_at: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          member_id: string;
          academy_plan_id: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          subscribed_at?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          next_billing_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          member_id?: string;
          academy_plan_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          subscribed_at?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          next_billing_at?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "member_subscriptions_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "member_subscriptions_member_id_fkey";
            columns: ["member_id"];
            referencedRelation: "academy_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "member_subscriptions_academy_plan_id_fkey";
            columns: ["academy_plan_id"];
            referencedRelation: "academy_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_attempts: {
        Row: {
          id: string;
          academy_id: string;
          member_subscription_id: string | null;
          academy_subscription_id: string | null;
          gateway: Database["public"]["Enums"]["payment_gateway"];
          amount_cents: number;
          status: Database["public"]["Enums"]["payment_attempt_status"];
          external_reference: string | null;
          failure_code: string | null;
          failure_reason: string | null;
          attempted_at: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          member_subscription_id?: string | null;
          academy_subscription_id?: string | null;
          gateway: Database["public"]["Enums"]["payment_gateway"];
          amount_cents: number;
          status?: Database["public"]["Enums"]["payment_attempt_status"];
          external_reference?: string | null;
          failure_code?: string | null;
          failure_reason?: string | null;
          attempted_at?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          member_subscription_id?: string | null;
          academy_subscription_id?: string | null;
          gateway?: Database["public"]["Enums"]["payment_gateway"];
          amount_cents?: number;
          status?: Database["public"]["Enums"]["payment_attempt_status"];
          external_reference?: string | null;
          failure_code?: string | null;
          failure_reason?: string | null;
          attempted_at?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_attempts_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_attempts_member_subscription_id_fkey";
            columns: ["member_subscription_id"];
            referencedRelation: "member_subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_attempts_academy_subscription_id_fkey";
            columns: ["academy_subscription_id"];
            referencedRelation: "academy_subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_notifications: {
        Row: {
          id: string;
          academy_id: string;
          member_subscription_id: string | null;
          academy_subscription_id: string | null;
          notification_type: Database["public"]["Enums"]["notification_type"];
          channel: Database["public"]["Enums"]["notification_channel"];
          status: Database["public"]["Enums"]["notification_status"];
          dedupe_key: string;
          payload: Json;
          scheduled_for: string;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          academy_id: string;
          member_subscription_id?: string | null;
          academy_subscription_id?: string | null;
          notification_type: Database["public"]["Enums"]["notification_type"];
          channel: Database["public"]["Enums"]["notification_channel"];
          status?: Database["public"]["Enums"]["notification_status"];
          dedupe_key: string;
          payload?: Json;
          scheduled_for?: string;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          academy_id?: string;
          member_subscription_id?: string | null;
          academy_subscription_id?: string | null;
          notification_type?: Database["public"]["Enums"]["notification_type"];
          channel?: Database["public"]["Enums"]["notification_channel"];
          status?: Database["public"]["Enums"]["notification_status"];
          dedupe_key?: string;
          payload?: Json;
          scheduled_for?: string;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_notifications_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_notifications_member_subscription_id_fkey";
            columns: ["member_subscription_id"];
            referencedRelation: "member_subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_notifications_academy_subscription_id_fkey";
            columns: ["academy_subscription_id"];
            referencedRelation: "academy_subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
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
          created_at: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      member_role: "student" | "instructor" | "owner";
      belt_rank: "white" | "blue" | "purple" | "brown" | "black" | "coral" | "red";
      checkin_status: "pending" | "approved" | "rejected";
      subscription_status: "trialing" | "active" | "past_due" | "canceled" | "expired";
      payment_gateway: "pix" | "stripe";
      payment_attempt_status: "pending" | "paid" | "failed" | "refunded";
      plan_periodicity: "monthly" | "quarterly" | "semiannual" | "annual";
      notification_type: "payment_due" | "payment_failed" | "payment_succeeded" | "subscription_expiring";
      notification_channel: "push" | "email" | "sms";
      notification_status: "pending" | "sent" | "failed";
    };
    CompositeTypes: {};
  };
};
