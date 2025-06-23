-- Create pokemon_cards table if it doesn't exist
CREATE TABLE IF NOT EXISTS pokemon_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) UNIQUE NOT NULL,
    rarity VARCHAR(10) NOT NULL CHECK (rarity IN ('SS', 'S', 'A', 'B', 'C')),
    image_url TEXT NOT NULL DEFAULT '/images/ngcard.jpg',
    market_price INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_rarity ON pokemon_cards(rarity);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_product_code ON pokemon_cards(product_code);
CREATE INDEX IF NOT EXISTS idx_pokemon_cards_created_at ON pokemon_cards(created_at);

-- Create updated_at trigger
CREATE TRIGGER update_pokemon_cards_updated_at 
    BEFORE UPDATE ON pokemon_cards
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create ai_generation_logs table for tracking AI generations
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'gacha_banner', 'card_image', 'effect_video', etc.
    prompt TEXT NOT NULL,
    result_url TEXT,
    settings JSONB DEFAULT '{}',
    cost DECIMAL(10, 4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ai_generation_logs
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_type ON ai_generation_logs(type);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_created_at ON ai_generation_logs(created_at);

-- Insert sample cards for testing
INSERT INTO pokemon_cards (card_name, product_code, rarity, image_url, market_price, description) VALUES
('ピカチュウex', 'PKM-001', 'SS', '/images/ngcard.jpg', 25000, '電気タイプの代表的なポケモン。強力な電撃攻撃が特徴。'),
('リザードンex', 'PKM-002', 'SS', '/images/ngcard.jpg', 30000, '炎タイプの最強クラス。翼を広げて空を駆ける。'),
('フシギバナex', 'PKM-003', 'S', '/images/ngcard.jpg', 15000, '草タイプのポケモン。背中の大きな花が美しい。'),
('カメックスex', 'PKM-004', 'S', '/images/ngcard.jpg', 18000, '水タイプのポケモン。甲羅から水流を放つ。'),
('ライチュウ', 'PKM-005', 'A', '/images/ngcard.jpg', 5000, 'ピカチュウの進化形。より強力な電撃を操る。'),
('ニャース', 'PKM-006', 'B', '/images/ngcard.jpg', 1500, 'ねこポケモン。小判を投げる技が得意。'),
('コラッタ', 'PKM-007', 'C', '/images/ngcard.jpg', 500, 'ねずみポケモン。前歯が特徴的。'),
('ポッポ', 'PKM-008', 'C', '/images/ngcard.jpg', 300, 'とりポケモン。空を自由に飛び回る。')
ON CONFLICT (product_code) DO NOTHING;