﻿export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
                Args: {
                    operationName?: string;
                    query?: string;
                    variables?: Json;
                    extensions?: Json;
                };
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
            generation_error_logs: {
                Row: {
                    error_code: string;
                    error_message: string;
                    error_timestamp: string;
                    id: number;
                    journey_id: number;
                    model: string;
                    source_text_hash: string;
                    source_text_length: number;
                };
                Insert: {
                    error_code: string;
                    error_message: string;
                    error_timestamp?: string;
                    id?: number;
                    journey_id: number;
                    model: string;
                    source_text_hash: string;
                    source_text_length: number;
                };
                Update: {
                    error_code?: string;
                    error_message?: string;
                    error_timestamp?: string;
                    id?: number;
                    journey_id?: number;
                    model?: string;
                    source_text_hash?: string;
                    source_text_length?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "generation_error_logs_journey_id_fkey";
                        columns: ["journey_id"];
                        isOneToOne: false;
                        referencedRelation: "journeys";
                        referencedColumns: ["id"];
                    },
                ];
            };
            generations: {
                Row: {
                    created_at: string;
                    edited_at: string;
                    edited_text: string | null;
                    generated_text: string;
                    id: number;
                    journey_id: number;
                    model: string;
                    source_text_hash: string;
                    source_text_length: number;
                    status: string;
                };
                Insert: {
                    created_at?: string;
                    edited_at?: string;
                    edited_text?: string | null;
                    generated_text: string;
                    id?: number;
                    journey_id: number;
                    model: string;
                    source_text_hash: string;
                    source_text_length: number;
                    status?: string;
                };
                Update: {
                    created_at?: string;
                    edited_at?: string;
                    edited_text?: string | null;
                    generated_text?: string;
                    id?: number;
                    journey_id?: number;
                    model?: string;
                    source_text_hash?: string;
                    source_text_length?: number;
                    status?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "generations_journey_id_fkey";
                        columns: ["journey_id"];
                        isOneToOne: false;
                        referencedRelation: "journeys";
                        referencedColumns: ["id"];
                    },
                ];
            };
            journeys: {
                Row: {
                    activities: Json | null;
                    additional_notes: string[];
                    created_at: string;
                    departure_date: string;
                    destination: string;
                    id: number;
                    return_date: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    activities?: Json | null;
                    additional_notes?: string[];
                    created_at?: string;
                    departure_date: string;
                    destination: string;
                    id?: number;
                    return_date: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    activities?: Json | null;
                    additional_notes?: string[];
                    created_at?: string;
                    departure_date?: string;
                    destination?: string;
                    id?: number;
                    return_date?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            preferences: {
                Row: {
                    created_at: string;
                    level: number;
                    preference: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    level: number;
                    preference?: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    level?: number;
                    preference?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
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
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
              Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
          Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
      ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
