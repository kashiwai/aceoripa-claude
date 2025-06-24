-- ガチャプールのシードデータ
-- まず、既存のpokemon_cardsを実際のカードデータで置き換える

-- 既存のデータをクリア
DELETE FROM gacha_pokemon_pools;
DELETE FROM pokemon_cards;

-- 実際のポケモンカードデータを挿入
INSERT INTO pokemon_cards (card_name, product_code, rarity, image_url, market_price, description) VALUES
-- SS賞
('マリオピカチュウ PSA10', 'PK-0008', 'SS', '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg', 500000, '特別なコラボレーションカード。PSA10の完璧な状態。'),
('ポンチョを着たピカチュウ(黒リザ) PSA10', 'PK-0010', 'SS', '/images/pokemon/010_ポンチョを着たピカチュウ(黒リザ) PSA10_PK-0010.jpg', 450000, '黒いリザードンのポンチョを着たピカチュウ。PSA10。'),
('ポンチョを着たピカチュウ(黒レックウザ) PSA10', 'PK-0019', 'SS', '/images/pokemon/019_ポンチョを着たピカチュウ(黒レックウザ) PSA10_PK-0019.jpg', 400000, '黒いレックウザのポンチョを着たピカチュウ。PSA10。'),
('おじょうさま PSA10', 'PK-0206', 'SS', '/images/pokemon/204_おじょうさま PSA10_PK-0206.jpg', 380000, '人気の高いサポートカード。PSA10。'),
('ヒガナ PSA10', 'PK-0223', 'SS', '/images/pokemon/220_ヒガナ PSA10_PK-0223.jpg', 350000, 'ドラゴン使いのトレーナーカード。PSA10。'),
('アセロラ PSA10', 'PK-0015', 'SS', '/images/pokemon/015_アセロラ PSA10_PK-0015.jpg', 320000, 'アローラ地方のゴーストタイプ使い。PSA10。'),
('ブルーの探索 PSA10', 'PK-0238', 'SS', '/images/pokemon/235_ブルーの探索 PSA10_PK-0238.jpg', 300000, '初代ジムリーダーのサポートカード。PSA10。'),
('ホロンの研究塔 1パック', 'PK-0124', 'SS', '/images/pokemon/123_ホロンの研究塔 1パック_PK-0124.jpg', 280000, '未開封の貴重なパック。'),
('ブラッキーex PSA10', 'PK-0199', 'SS', '/images/pokemon/197_ブラッキーex PSA10_PK-0199.jpg', 250000, '月光ポケモン。強力なex。PSA10。'),
('アローラの仲間たち PSA10', 'PK-0032', 'SS', '/images/pokemon/032_アローラの仲間たち PSA10_PK-0032.jpg', 230000, 'アローラ地方の人気キャラクターたち。PSA10。'),

-- S賞
('アセロラ(エクバ) PSA10', 'PK-0003', 'S', '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg', 150000, 'エクストラバトルの日のプロモカード。PSA10。'),
('ブルーの探索 PSA10', 'PK-0187', 'S', '/images/pokemon/185_ブルーの探索 PSA10_PK-0187.jpg', 120000, '人気のサポートカード。PSA10。'),
('ニンフィアEX PSA10（エラー版）', 'PK-0139', 'S', '/images/pokemon/137_ニンフィアEX PSA10（エラー版）_PK-0139.jpg', 100000, '印刷エラーのある希少版。PSA10。'),
('マリオピカチュウ PSA10', 'PK-0081', 'S', '/images/pokemon/081_マリオピカチュウ PSA10_PK-0081.jpg', 80000, 'マリオとのコラボカード。PSA10。'),

-- A賞
('ポンチョを着たピカチュウ(リザ) PSA10', 'PK-0016', 'A', '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg', 50000, 'リザードンのポンチョを着たピカチュウ。PSA10。'),
('ポンチョを着たピカチュウ(レックウザ) PSA10', 'PK-0020', 'A', '/images/pokemon/020_ポンチョを着たピカチュウ(レックウザ) PSA10_PK-0020.jpg', 45000, 'レックウザのポンチョを着たピカチュウ。PSA10。'),
('ポンチョを着たピカチュウ(ロコン)', 'PK-0153', 'A', '/images/pokemon/151_ポンチョを着たピカチュウ(ロコン)_PK-0153.jpg', 30000, 'ロコンのポンチョを着たピカチュウ。'),
('ブルーの探索', 'PK-0251', 'A', '/images/pokemon/248_ブルーの探索_PK-0251.jpg', 25000, '人気のサポートカード。'),

-- B賞
('アセロラ（エクバ）', 'PK-0009', 'B', '/images/pokemon/009_アセロラ（エクバ）_PK-0009.jpg', 15000, 'エクストラバトルの日のプロモカード。'),
('アセロラ', 'PK-0028', 'B', '/images/pokemon/028_アセロラ_PK-0028.jpg', 12000, 'ゴーストタイプ使いのトレーナー。'),
('THE BEST OF XY 1BOX', 'PK-0034', 'B', '/images/pokemon/034_THE BEST OF XY 1BOX_PK-0034.jpg', 20000, 'XYシリーズのベストコレクションBOX。'),

-- C賞
('アローラの仲間たち', 'PK-0061', 'C', '/images/pokemon/061_アローラの仲間たち_PK-0061.jpg', 5000, 'アローラ地方のキャラクターたち。'),
('ポケモンカード各種', 'PK-MISC-001', 'C', '/images/ngcard.jpg', 3000, 'その他の人気ポケモンカード。')
ON CONFLICT (product_code) DO UPDATE SET
  card_name = EXCLUDED.card_name,
  rarity = EXCLUDED.rarity,
  image_url = EXCLUDED.image_url,
  market_price = EXCLUDED.market_price,
  description = EXCLUDED.description;

-- ガチャプールを作成（各ガチャに対してカードを割り当て）
-- ピカチュウ大祭り（ID: 1）
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  pc.id,
  CASE 
    WHEN pc.rarity = 'SS' THEN 10    -- SS: 1%（10/1000）
    WHEN pc.rarity = 'S' THEN 40     -- S: 4%（40/1000）
    WHEN pc.rarity = 'A' THEN 150    -- A: 15%（150/1000）
    WHEN pc.rarity = 'B' THEN 300    -- B: 30%（300/1000）
    WHEN pc.rarity = 'C' THEN 500    -- C: 50%（500/1000）
  END
FROM pokemon_cards pc
WHERE pc.product_code IN (
  'PK-0008', 'PK-0010', 'PK-0019', -- SS
  'PK-0003', 'PK-0187', 'PK-0199', -- S
  'PK-0016', 'PK-0032', -- A
  'PK-0009', 'PK-0028', 'PK-0061', -- B
  'PK-MISC-001' -- C
)
ON CONFLICT DO NOTHING;

-- ナンジャモ大量発生オリパ（ID: 2）
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight)
SELECT 
  '00000000-0000-0000-0000-000000000002'::uuid,
  pc.id,
  CASE 
    WHEN pc.rarity = 'SS' THEN 10
    WHEN pc.rarity = 'S' THEN 40
    WHEN pc.rarity = 'A' THEN 150
    WHEN pc.rarity = 'B' THEN 300
    WHEN pc.rarity = 'C' THEN 500
  END
FROM pokemon_cards pc
WHERE pc.product_code IN (
  'PK-0206', 'PK-0223', 'PK-0015', -- SS
  'PK-0139', -- S
  'PK-0020', -- A
  'PK-0009', 'PK-0028', -- B
  'PK-0061', 'PK-MISC-001' -- C
)
ON CONFLICT DO NOTHING;

-- リザードン祭盤（ID: 3）
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight)
SELECT 
  '00000000-0000-0000-0000-000000000003'::uuid,
  pc.id,
  CASE 
    WHEN pc.rarity = 'SS' THEN 10
    WHEN pc.rarity = 'S' THEN 40
    WHEN pc.rarity = 'A' THEN 150
    WHEN pc.rarity = 'B' THEN 300
    WHEN pc.rarity = 'C' THEN 500
  END
FROM pokemon_cards pc
WHERE pc.product_code IN (
  'PK-0081', 'PK-0238', 'PK-0124', -- SS
  'PK-0153', -- S
  'PK-0251', -- A
  'PK-0034', -- B
  'PK-0028', 'PK-MISC-001' -- C
)
ON CONFLICT DO NOTHING;

-- ブラッキー超感謝祭（ID: 4）
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight)
SELECT 
  '00000000-0000-0000-0000-000000000004'::uuid,
  pc.id,
  CASE 
    WHEN pc.rarity = 'SS' THEN 10
    WHEN pc.rarity = 'S' THEN 40
    WHEN pc.rarity = 'A' THEN 150
    WHEN pc.rarity = 'B' THEN 300
    WHEN pc.rarity = 'C' THEN 500
  END
FROM pokemon_cards pc
WHERE pc.product_code IN (
  'PK-0199', 'PK-0206', 'PK-0223', -- SS
  'PK-0008', -- S
  'PK-0003', -- A
  'PK-0187', -- B
  'PK-0139', 'PK-MISC-001' -- C
)
ON CONFLICT DO NOTHING;

-- リーリエ×マリオピカチュウ（ID: 5）
INSERT INTO gacha_pokemon_pools (gacha_product_id, pokemon_card_id, weight)
SELECT 
  '00000000-0000-0000-0000-000000000005'::uuid,
  pc.id,
  CASE 
    WHEN pc.rarity = 'SS' THEN 10
    WHEN pc.rarity = 'S' THEN 40
    WHEN pc.rarity = 'A' THEN 150
    WHEN pc.rarity = 'B' THEN 300
    WHEN pc.rarity = 'C' THEN 500
  END
FROM pokemon_cards pc
WHERE pc.product_code IN (
  'PK-0032', 'PK-0010', 'PK-0016', -- SS
  'PK-0081', -- S
  'PK-0019', -- A
  'PK-0020', -- B
  'PK-0153', 'PK-MISC-001' -- C
)
ON CONFLICT DO NOTHING;