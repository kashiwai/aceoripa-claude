-- ガチャとポケモンカードの関連テーブル作成
CREATE TABLE IF NOT EXISTS gacha_pokemon_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gacha_product_id VARCHAR(100) NOT NULL,
    pokemon_card_id VARCHAR(100) NOT NULL,
    weight INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pokemon_card FOREIGN KEY (pokemon_card_id) REFERENCES pokemon_cards(id)
);

-- インデックスを作成
CREATE INDEX idx_gacha_pokemon_pools_gacha_id ON gacha_pokemon_pools(gacha_product_id);
CREATE INDEX idx_gacha_pokemon_pools_card_id ON gacha_pokemon_pools(pokemon_card_id);

-- RLSを有効化
ALTER TABLE gacha_pokemon_pools ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー（認証不要）
CREATE POLICY "Allow public read access to gacha pools" ON gacha_pokemon_pools
    FOR SELECT USING (true);

-- サンプルデータ投入（ガチャID: 1 - ピカチュウ大祭り）
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight) VALUES
-- SS賞 (1%)
('1', 'PK-0008', 1),  -- マリオピカチュウ PSA10
('1', 'PK-0010', 1),  -- ポンチョを着たピカチュウ(黒リザ) PSA10
('1', 'PK-0019', 1),  -- ポンチョを着たピカチュウ(黒レックウザ) PSA10

-- S賞 (4%)
('1', 'PK-0003', 4),  -- アセロラ(エクバ) PSA10
('1', 'PK-0187', 4),  -- ブルーの探索 PSA10
('1', 'PK-0199', 4),  -- ブラッキーex PSA10

-- A賞 (15%)
('1', 'PK-0016', 5),  -- ポンチョを着たピカチュウ(リザ) PSA10
('1', 'PK-0032', 5),  -- アローラの仲間たち PSA10
('1', 'PK-0206', 5),  -- おじょうさま PSA10

-- B賞 (30%)
('1', 'PK-0009', 10), -- アセロラ（エクバ）
('1', 'PK-0028', 10), -- アセロラ
('1', 'PK-0061', 10), -- アローラの仲間たち

-- C賞 (50%)
('1', 'PK-0153', 17), -- ポンチョを着たピカチュウ(ロコン)
('1', 'PK-0251', 17), -- ブルーの探索
('1', 'PK-0034', 16); -- THE BEST OF XY 1BOX

-- ガチャID: 2 - ナンジャモ大量発生オリパ
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight) VALUES
-- SS賞
('2', 'PK-0206', 1),  -- おじょうさま PSA10
('2', 'PK-0223', 1),  -- ヒガナ PSA10
('2', 'PK-0015', 1),  -- アセロラ PSA10

-- S賞
('2', 'PK-0139', 4),  -- ニンフィアEX PSA10（エラー版）
('2', 'PK-0081', 4),  -- マリオピカチュウ PSA10
('2', 'PK-0238', 4),  -- ブルーの探索 PSA10

-- A賞
('2', 'PK-0020', 5),  -- ポンチョを着たピカチュウ(レックウザ) PSA10
('2', 'PK-0124', 5),  -- ホロンの研究塔 1パック
('2', 'PK-0019', 5),  -- ポンチョを着たピカチュウ(黒レックウザ) PSA10

-- B賞
('2', 'PK-0009', 10), -- アセロラ（エクバ）
('2', 'PK-0153', 10), -- ポンチョを着たピカチュウ(ロコン)
('2', 'PK-0251', 10), -- ブルーの探索

-- C賞
('2', 'PK-0028', 17), -- アセロラ
('2', 'PK-0061', 17), -- アローラの仲間たち
('2', 'PK-0034', 16); -- THE BEST OF XY 1BOX

-- ガチャID: 3 - リザードン祭盤
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight) VALUES
-- SS賞
('3', 'PK-0081', 1),  -- マリオピカチュウ PSA10
('3', 'PK-0238', 1),  -- ブルーの探索 PSA10
('3', 'PK-0124', 1),  -- ホロンの研究塔 1パック

-- S賞
('3', 'PK-0010', 4),  -- ポンチョを着たピカチュウ(黒リザ) PSA10
('3', 'PK-0016', 4),  -- ポンチョを着たピカチュウ(リザ) PSA10
('3', 'PK-0019', 4),  -- ポンチョを着たピカチュウ(黒レックウザ) PSA10

-- A賞
('3', 'PK-0153', 5),  -- ポンチョを着たピカチュウ(ロコン)
('3', 'PK-0003', 5),  -- アセロラ(エクバ) PSA10
('3', 'PK-0187', 5),  -- ブルーの探索 PSA10

-- B賞
('3', 'PK-0251', 10), -- ブルーの探索
('3', 'PK-0199', 10), -- ブラッキーex PSA10
('3', 'PK-0032', 10), -- アローラの仲間たち PSA10

-- C賞
('3', 'PK-0034', 17), -- THE BEST OF XY 1BOX
('3', 'PK-0028', 17), -- アセロラ
('3', 'PK-0061', 16); -- アローラの仲間たち

-- ガチャID: 4 - ブラッキー超感謝祭
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight) VALUES
-- SS賞
('4', 'PK-0199', 1),  -- ブラッキーex PSA10
('4', 'PK-0206', 1),  -- おじょうさま PSA10
('4', 'PK-0223', 1),  -- ヒガナ PSA10

-- S賞
('4', 'PK-0008', 4),  -- マリオピカチュウ PSA10
('4', 'PK-0010', 4),  -- ポンチョを着たピカチュウ(黒リザ) PSA10
('4', 'PK-0016', 4),  -- ポンチョを着たピカチュウ(リザ) PSA10

-- A賞
('4', 'PK-0003', 5),  -- アセロラ(エクバ) PSA10
('4', 'PK-0015', 5),  -- アセロラ PSA10
('4', 'PK-0032', 5),  -- アローラの仲間たち PSA10

-- B賞
('4', 'PK-0187', 10), -- ブルーの探索 PSA10
('4', 'PK-0238', 10), -- ブルーの探索 PSA10
('4', 'PK-0251', 10), -- ブルーの探索

-- C賞
('4', 'PK-0139', 17), -- ニンフィアEX PSA10（エラー版）
('4', 'PK-0124', 17), -- ホロンの研究塔 1パック
('4', 'PK-0034', 16); -- THE BEST OF XY 1BOX

-- ガチャID: 5 - リーリエ×マリオピカチュウ
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight) VALUES
-- SS賞
('5', 'PK-0032', 1),  -- アローラの仲間たち PSA10
('5', 'PK-0010', 1),  -- ポンチョを着たピカチュウ(黒リザ) PSA10
('5', 'PK-0016', 1),  -- ポンチョを着たピカチュウ(リザ) PSA10

-- S賞
('5', 'PK-0081', 4),  -- マリオピカチュウ PSA10
('5', 'PK-0008', 4),  -- マリオピカチュウ PSA10
('5', 'PK-0003', 4),  -- アセロラ(エクバ) PSA10

-- A賞
('5', 'PK-0019', 5),  -- ポンチョを着たピカチュウ(黒レックウザ) PSA10
('5', 'PK-0206', 5),  -- おじょうさま PSA10
('5', 'PK-0223', 5),  -- ヒガナ PSA10

-- B賞
('5', 'PK-0020', 10), -- ポンチョを着たピカチュウ(レックウザ) PSA10
('5', 'PK-0139', 10), -- ニンフィアEX PSA10（エラー版）
('5', 'PK-0015', 10), -- アセロラ PSA10

-- C賞
('5', 'PK-0153', 17), -- ポンチョを着たピカチュウ(ロコン)
('5', 'PK-0028', 17), -- アセロラ
('5', 'PK-0061', 16); -- アローラの仲間たち