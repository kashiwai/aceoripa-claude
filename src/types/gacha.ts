// ガチャ関連の型定義

export interface CardData {
  id: string;
  card_name: string;
  product_code?: string;
  rarity: string;
  image_url?: string;
  imageUrl?: string;
  market_price?: number;
  description?: string;
}

export interface GachaProduct {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  description?: string;
  banner_image_url?: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GachaResult {
  id: string;
  user_id: string;
  gacha_product_id: string;
  card_id: string;
  created_at?: string;
  card?: CardData;
}

export interface GachaPool {
  id: string;
  gacha_product_id: string;
  card_id: string;
  probability: number;
  card?: CardData;
}

export type Rarity = 'SSR' | 'SR' | 'R' | 'N' | 'SS' | 'S' | 'A' | 'B' | 'C';
