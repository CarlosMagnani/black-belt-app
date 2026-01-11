export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: string | null;
          avatar_url: string | null;
          current_belt: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          current_belt?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          current_belt?: string | null;
          created_at?: string | null;
        };
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
      };
    };
  };
};
