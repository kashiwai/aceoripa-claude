-- ガチャとポケモンカードを関連付けるテーブル
CREATE TABLE gacha_pokemon_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gacha_product_id UUID NOT NULL REFERENCES gacha_products(id) ON DELETE CASCADE,
  pokemon_card_id UUID NOT NULL REFERENCES pokemon_cards(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 100, -- 出現確率の重み（高いほど出やすい）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gacha_product_id, pokemon_card_id)
);

-- インデックスの作成
CREATE INDEX idx_gacha_pokemon_pools_gacha_id ON gacha_pokemon_pools(gacha_product_id);
CREATE INDEX idx_gacha_pokemon_pools_card_id ON gacha_pokemon_pools(pokemon_card_id);

-- 更新日時の自動更新
CREATE TRIGGER update_gacha_pokemon_pools_updated_at BEFORE UPDATE ON gacha_pokemon_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ガチャ結果記録テーブル（ポケモンカード版）
CREATE TABLE gacha_results_pokemon (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gacha_product_id UUID NOT NULL REFERENCES gacha_products(id),
  pokemon_card_id UUID NOT NULL REFERENCES pokemon_cards(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_gacha_results_pokemon_user_id ON gacha_results_pokemon(user_id);
CREATE INDEX idx_gacha_results_pokemon_gacha_id ON gacha_results_pokemon(gacha_product_id);
CREATE INDEX idx_gacha_results_pokemon_card_id ON gacha_results_pokemon(pokemon_card_id);

-- ユーザーコレクションテーブル（ポケモンカード版）
CREATE TABLE user_pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pokemon_card_id UUID NOT NULL REFERENCES pokemon_cards(id),
  quantity INTEGER DEFAULT 1,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pokemon_card_id)
);

-- インデックスの作成
CREATE INDEX idx_user_pokemon_cards_user_id ON user_pokemon_cards(user_id);
CREATE INDEX idx_user_pokemon_cards_card_id ON user_pokemon_cards(pokemon_card_id);