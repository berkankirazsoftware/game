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
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            campaigns: {
                Row: {
                    created_at: string | null
                    game_type: string
                    games: string[] | null
                    id: string
                    name: string
                    status: string | null
                    theme: string | null
                    type: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    game_type: string
                    games?: string[] | null
                    id?: string
                    name: string
                    status?: string | null
                    theme?: string | null
                    type?: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    game_type?: string
                    games?: string[] | null
                    id?: string
                    name?: string
                    status?: string | null
                    theme?: string | null
                    type?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            coupons: {
                Row: {
                    code: string | null
                    created_at: string | null
                    description: string
                    discount_type: string | null
                    discount_value: number
                    id: string
                    level: number
                    quantity: number
                    used_count: number
                    user_id: string | null
                }
                Insert: {
                    code?: string | null
                    created_at?: string | null
                    description: string
                    discount_type?: string | null
                    discount_value: number
                    id?: string
                    level?: number
                    quantity: number
                    used_count?: number
                    user_id?: string | null
                }
                Update: {
                    code?: string | null
                    created_at?: string | null
                    description?: string
                    discount_type?: string | null
                    discount_value?: number
                    id?: string
                    level?: number
                    quantity?: number
                    used_count?: number
                    user_id?: string | null
                }
                Relationships: []
            }
            coupon_codes: {
                Row: {
                    code: string
                    coupon_id: string
                    user_id: string
                    created_at: string | null
                    id: string
                    is_used: boolean | null
                }
                Insert: {
                    code: string
                    coupon_id: string
                    user_id: string
                    created_at?: string | null
                    id?: string
                    is_used?: boolean | null
                }
                Update: {
                    code?: string
                    coupon_id?: string
                    created_at?: string | null
                    id?: string
                    is_used?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "coupon_codes_coupon_id_fkey"
                        columns: ["coupon_id"]
                        isOneToOne: false
                        referencedRelation: "coupons"
                        referencedColumns: ["id"]
                    }
                ]
            }
            email_logs: {
                Row: {
                    coupon_code: string
                    created_at: string | null
                    discount_type: string
                    discount_value: number
                    email: string
                    email_service_id: string | null
                    game_type: string
                    id: string
                    sent_at: string | null
                    status: string
                    user_id: string | null
                }
                Insert: {
                    coupon_code: string
                    created_at?: string | null
                    discount_type: string
                    discount_value: number
                    email: string
                    email_service_id?: string | null
                    game_type: string
                    id?: string
                    sent_at?: string | null
                    status?: string
                    user_id?: string | null
                }
                Update: {
                    coupon_code?: string
                    created_at?: string | null
                    discount_type?: string
                    discount_value?: number
                    email?: string
                    email_service_id?: string | null
                    game_type?: string
                    id?: string
                    sent_at?: string | null
                    status?: string
                    user_id?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    business_name: string | null
                    created_at: string | null
                    email: string
                    full_name: string
                    id: string
                    widget_config: { cooldown_minutes: number } | null
                }
                Insert: {
                    business_name?: string | null
                    created_at?: string | null
                    email: string
                    full_name: string
                    id: string
                    widget_config?: { cooldown_minutes: number } | null
                }
                Update: {
                    business_name?: string | null
                    created_at?: string | null
                    email?: string
                    full_name?: string
                    id?: string
                    widget_config?: { cooldown_minutes: number } | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            check_widget_status: {
                Args: {
                    p_user_id: string
                }
                Returns: Json
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
