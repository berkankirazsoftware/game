export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            coupons: {
                Row: {
                    code: string
                    created_at: string | null
                    description: string
                    discount_type: 'percentage' | 'fixed' | null
                    discount_value: number
                    id: string
                    level: number
                    quantity: number
                    used_count: number
                    user_id: string | null
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    description: string
                    discount_type?: 'percentage' | 'fixed' | null
                    discount_value: number
                    id?: string
                    level?: number
                    quantity?: number
                    used_count?: number
                    user_id?: string | null
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    description?: string
                    discount_type?: 'percentage' | 'fixed' | null
                    discount_value?: number
                    id?: string
                    level?: number
                    quantity?: number
                    used_count?: number
                    user_id?: string | null
                }
            }
            email_logs: {
                Row: {
                    coupon_code: string
                    created_at: string | null
                    discount_type: 'percentage' | 'fixed'
                    discount_value: number
                    email: string
                    email_service_id: string | null
                    game_type: string
                    id: string
                    sent_at: string | null
                    status: 'sent' | 'failed' | 'pending'
                    user_id: string | null
                }
                Insert: {
                    coupon_code: string
                    created_at?: string | null
                    discount_type: 'percentage' | 'fixed'
                    discount_value: number
                    email: string
                    email_service_id?: string | null
                    game_type: string
                    status?: 'sent' | 'failed' | 'pending'
                    sent_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    coupon_code?: string
                    created_at?: string | null
                    discount_type?: 'percentage' | 'fixed'
                    discount_value?: number
                    email?: string
                    email_service_id?: string | null
                    game_type?: string
                    status?: 'sent' | 'failed' | 'pending'
                    sent_at?: string | null
                    user_id?: string | null
                }
            }
            profiles: {
                Row: {
                    business_name: string | null
                    created_at: string | null
                    email: string
                    full_name: string
                    id: string
                }
                Insert: {
                    business_name?: string | null
                    created_at?: string | null
                    email: string
                    full_name: string
                    id: string
                }
                Update: {
                    business_name?: string | null
                    created_at?: string | null
                    email?: string
                    full_name?: string
                    id?: string
                }
            }
            subscriptions: {
                Row: {
                    created_at: string | null
                    expiration_date: string | null
                    id: string
                    is_active: boolean
                    plan_type: 'basic' | 'advanced' | 'free'
                    start_date: string
                    updated_at: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    expiration_date?: string | null
                    id?: string
                    is_active?: boolean
                    plan_type: 'basic' | 'advanced' | 'free'
                    start_date?: string
                    updated_at?: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    expiration_date?: string | null
                    id?: string
                    is_active?: boolean
                    plan_type?: 'basic' | 'advanced' | 'free'
                    start_date?: string
                    updated_at?: string
                    user_id?: string
                }
            }
            user_games: {
                Row: {
                    created_at: string | null
                    id: string
                    user_id: string | null
                    game_type: string | null
                    score: number | null
                    metadata: Json | null
                    guest_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    user_id?: string | null
                    game_type?: string | null
                    score?: number | null
                    metadata?: Json | null
                    guest_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    user_id?: string | null
                    game_type?: string | null
                    score?: number | null
                    metadata?: Json | null
                    guest_id?: string | null
                }
            }
            campaigns: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    game_type: string
                    status: 'active' | 'draft' | 'ended'
                    type: string
                    theme: string
                    games: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    game_type: string
                    status?: 'active' | 'draft' | 'ended'
                    type?: string
                    theme?: string
                    games?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    game_type?: string
                    status?: 'active' | 'draft' | 'ended'
                    theme?: string
                    games?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Functions: {
            check_widget_status: {
                Args: { p_user_id: string }
                Returns: Json
            }
        }
    }
}
