export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      completed_steps: {
        Row: {
          created_at: string;
          game_id: string;
          id: number;
          step_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          game_id: string;
          id?: number;
          step_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          game_id?: string;
          id?: number;
          step_id?: string;
          user_id?: string;
        };
      };
      games: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
