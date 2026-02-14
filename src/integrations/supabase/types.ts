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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deck_kanjis: {
        Row: {
          deck_id: string
          id: string
          kanji_id: string
          position: number
        }
        Insert: {
          deck_id: string
          id?: string
          kanji_id: string
          position?: number
        }
        Update: {
          deck_id?: string
          id?: string
          kanji_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "deck_kanjis_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_kanjis_kanji_id_fkey"
            columns: ["kanji_id"]
            isOneToOne: false
            referencedRelation: "kanjis"
            referencedColumns: ["id"]
          },
        ]
      }
      decks: {
        Row: {
          cover_emoji: string | null
          created_at: string
          description: string | null
          id: string
          is_custom: boolean
          is_official: boolean
          jlpt_level: number | null
          kanji_count: number
          name: string
          required_level: number
          updated_at: string
          user_id: string | null
          xp_multiplier: number
        }
        Insert: {
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean
          is_official?: boolean
          jlpt_level?: number | null
          kanji_count?: number
          name: string
          required_level?: number
          updated_at?: string
          user_id?: string | null
          xp_multiplier?: number
        }
        Update: {
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_custom?: boolean
          is_official?: boolean
          jlpt_level?: number | null
          kanji_count?: number
          name?: string
          required_level?: number
          updated_at?: string
          user_id?: string | null
          xp_multiplier?: number
        }
        Relationships: []
      }
      kanjis: {
        Row: {
          created_at: string
          frequency: number | null
          id: string
          jlpt_level: number
          kanji: string
          kunyomi: string[]
          kunyomi_romaji: string[]
          meaning_en: string | null
          meaning_fr: string
          onyomi: string[]
          onyomi_romaji: string[]
          stroke_count: number | null
        }
        Insert: {
          created_at?: string
          frequency?: number | null
          id?: string
          jlpt_level: number
          kanji: string
          kunyomi?: string[]
          kunyomi_romaji?: string[]
          meaning_en?: string | null
          meaning_fr: string
          onyomi?: string[]
          onyomi_romaji?: string[]
          stroke_count?: number | null
        }
        Update: {
          created_at?: string
          frequency?: number | null
          id?: string
          jlpt_level?: number
          kanji?: string
          kunyomi?: string[]
          kunyomi_romaji?: string[]
          meaning_en?: string | null
          meaning_fr?: string
          onyomi?: string[]
          onyomi_romaji?: string[]
          stroke_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_level: number
          current_streak: number
          id: string
          kanjis_learned: number
          last_study_date: string | null
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          kanjis_learned?: number
          last_study_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          kanjis_learned?: number
          last_study_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          cards_studied: number
          correct_answers: number
          deck_id: string | null
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          cards_studied?: number
          correct_answers?: number
          deck_id?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          cards_studied?: number
          correct_answers?: number
          deck_id?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_deck_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          deck_id: string
          id: string
          last_studied_at: string | null
          times_completed: number
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deck_id: string
          id?: string
          last_studied_at?: string | null
          times_completed?: number
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deck_id?: string
          id?: string
          last_studied_at?: string | null
          times_completed?: number
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_deck_progress_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_kanji_progress: {
        Row: {
          correct_reviews: number
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          kanji_id: string
          last_review_date: string | null
          next_review_date: string
          repetitions: number
          total_reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_reviews?: number
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          kanji_id: string
          last_review_date?: string | null
          next_review_date?: string
          repetitions?: number
          total_reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_reviews?: number
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          kanji_id?: string
          last_review_date?: string | null
          next_review_date?: string
          repetitions?: number
          total_reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_kanji_progress_kanji_id_fkey"
            columns: ["kanji_id"]
            isOneToOne: false
            referencedRelation: "kanjis"
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
