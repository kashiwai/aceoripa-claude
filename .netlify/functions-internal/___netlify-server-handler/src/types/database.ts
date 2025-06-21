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
      users: {
        Row: {
          id: string
          email: string
          provider: string | null
          provider_id: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          provider?: string | null
          provider_id?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          provider?: string | null
          provider_id?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          name: string
          description: string | null
          rarity: 'common' | 'rare' | 'super_rare' | 'ultra_rare' | 'legendary'
          image_url: string
          category: string | null
          attributes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          rarity: 'common' | 'rare' | 'super_rare' | 'ultra_rare' | 'legendary'
          image_url: string
          category?: string | null
          attributes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          rarity?: 'common' | 'rare' | 'super_rare' | 'ultra_rare' | 'legendary'
          image_url?: string
          category?: string | null
          attributes?: Json | null
          created_at?: string
        }
      }
      user_cards: {
        Row: {
          id: string
          user_id: string
          card_id: string
          obtained_at: string
          is_favorite: boolean
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          obtained_at?: string
          is_favorite?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          obtained_at?: string
          is_favorite?: boolean
        }
      }
      gacha_products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          card_count: number
          bonus_cards: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          currency?: string
          card_count: number
          bonus_cards?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          card_count?: number
          bonus_cards?: number
          is_active?: boolean
          created_at?: string
        }
      }
      gacha_pools: {
        Row: {
          id: string
          product_id: string
          card_id: string
          weight: number
        }
        Insert: {
          id?: string
          product_id: string
          card_id: string
          weight?: number
        }
        Update: {
          id?: string
          product_id?: string
          card_id?: string
          weight?: number
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          product_id: string
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method: string | null
          payment_id: string | null
          metadata: Json | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          amount: number
          currency?: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string | null
          payment_id?: string | null
          metadata?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_method?: string | null
          payment_id?: string | null
          metadata?: Json | null
          created_at?: string
          completed_at?: string | null
        }
      }
      gacha_results: {
        Row: {
          id: string
          transaction_id: string
          card_id: string
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          card_id: string
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          card_id?: string
          created_at?: string
        }
      }
      user_points: {
        Row: {
          id: string
          user_id: string
          free_points: number
          paid_points: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          free_points?: number
          paid_points?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          free_points?: number
          paid_points?: number
          updated_at?: string
        }
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'purchase' | 'use' | 'bonus' | 'refund'
          is_paid: boolean
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'purchase' | 'use' | 'bonus' | 'refund'
          is_paid?: boolean
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'purchase' | 'use' | 'bonus' | 'refund'
          is_paid?: boolean
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}