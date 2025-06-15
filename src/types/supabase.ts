export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      link_chats: {
        Row: {
          created_at: string | null
          id: string
          link_id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_id: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link_id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_chats_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "shared_links"
            referencedColumns: ["id"]
          },
        ]
      }
      ring_members: {
        Row: {
          id: string
          joined_at: string | null
          ring_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          ring_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          ring_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ring_members_ring_id_fkey"
            columns: ["ring_id"]
            isOneToOne: false
            referencedRelation: "rings"
            referencedColumns: ["id"]
          },
        ]
      }
      rings: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          invite_code: string
          is_public: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invite_code: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invite_code?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_links: {
        Row: {
          created_at: string | null
          id: string
          link_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_links_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "shared_links"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_links: {
        Row: {
          created_at: string | null
          description: string | null
          embed_data: Json | null
          embed_type: string | null
          id: string
          ring_id: string | null
          title: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embed_data?: Json | null
          embed_type?: string | null
          id?: string
          ring_id?: string | null
          title: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embed_data?: Json | null
          embed_type?: string | null
          id?: string
          ring_id?: string | null
          title?: string
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_links_ring_id_fkey"
            columns: ["ring_id"]
            isOneToOne: false
            referencedRelation: "rings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      watch_parties: {
        Row: {
          category: string | null
          created_at: string | null
          current_time_position: number | null
          description: string | null
          embed_data: Json | null
          embed_type: string | null
          expires_at: string | null
          id: string
          invite_code: string | null
          is_active: boolean | null
          is_playing: boolean | null
          is_public: boolean | null
          owner_id: string
          ring_id: string | null
          title: string | null
          video_url: string
          viewer_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_time_position?: number | null
          description?: string | null
          embed_data?: Json | null
          embed_type?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          is_playing?: boolean | null
          is_public?: boolean | null
          owner_id: string
          ring_id?: string | null
          title?: string | null
          video_url: string
          viewer_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_time_position?: number | null
          description?: string | null
          embed_data?: Json | null
          embed_type?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string | null
          is_active?: boolean | null
          is_playing?: boolean | null
          is_public?: boolean | null
          owner_id?: string
          ring_id?: string | null
          title?: string | null
          video_url?: string
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_watch_parties_owner_id"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_watch_parties_ring_id"
            columns: ["ring_id"]
            isOneToOne: false
            referencedRelation: "rings"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          party_id: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          party_id: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          party_id?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_watch_party_messages_party_id"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_watch_party_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_users: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string | null
          last_seen: string | null
          party_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          party_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          last_seen?: string | null
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_watch_party_users_party_id"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_watch_party_users_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_link_chats: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_watch_parties: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_watch_party_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_watch_party_viewer_count: {
        Args: { party_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
