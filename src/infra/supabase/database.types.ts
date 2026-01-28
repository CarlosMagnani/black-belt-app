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
      academy_class_schedule: {
        Row: {
          id: string;
          academy_id: string;
          title: string;
          instructor_name: string | null;
          weekday: number;
          start_time: string;
          end_time: string;
          location: string | null;
          level: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          academy_id: string;
          title: string;
          instructor_name?: string | null;
          weekday: number;
          start_time: string;
          end_time: string;
          location?: string | null;
          level?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          academy_id?: string;
          title?: string;
          instructor_name?: string | null;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          level?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "academy_class_schedule_academy_id_fkey";
            columns: ["academy_id"];
            referencedRelation: "academies";
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
          created_at: string | null;
        }[];
      };
    };
    Enums: {
      user_role: "professor" | "student";
    };
    CompositeTypes: {};
  };
};
