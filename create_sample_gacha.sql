-- サンプルガチャデータ作成（リアルガチャバナー5枚分）

INSERT INTO gacha_products (
  name,
  description,
  single_price,
  multi_price,
  is_active,
  start_date,
  end_date,
  banner_image_url,
  featured_card_ids,
  guarantee_sr_on_multi,
  metadata
) VALUES 
(
  'ピカチュウ大祭り',
  '還元率97%！ポンチョを着たピカチュウPSA10確定！',
  150,
  1500,
  true,
  NOW(),
  NOW() + INTERVAL '30 days',
  '/images/banners/real-gacha/S__44392515_0.jpg',
  ARRAY['PK-M001', 'PK-M002', 'PK-M006'],
  true,
  '{"total_stock": 1000, "is_free_points_only": false, "required_user_rank": "", "cost_per_card": 50, "ss_guarantee_threshold": 0.7, "animation_settings": {"SS": "premium", "S": "special", "A": "normal", "B": "normal", "C": "normal"}}'::jsonb
),
(
  'ナンジャモ大量発生オリパ',
  '還元率100%超え！ナンジャモSAR PSA10確定！',
  200,
  2000,
  true,
  NOW(),
  NOW() + INTERVAL '30 days',
  '/images/banners/real-gacha/S__44392516_0.jpg',
  ARRAY['NJ-T001', 'NJ-T002', 'NJ-T003'],
  true,
  '{"total_stock": 1000, "is_free_points_only": false, "required_user_rank": "", "cost_per_card": 60, "ss_guarantee_threshold": 0.7, "animation_settings": {"SS": "premium", "S": "special", "A": "normal", "B": "normal", "C": "normal"}}'::jsonb
),
(
  'リザードン祭盤 炎のプレミアオリパ',
  '還元率97%！リザードンVMAX HR PSA10確定！',
  300,
  3000,
  true,
  NOW(),
  NOW() + INTERVAL '30 days',
  '/images/banners/real-gacha/S__44392517_0.jpg',
  ARRAY['CZ-F001', 'CZ-F002', 'CZ-F003'],
  true,
  '{"total_stock": 1000, "is_free_points_only": false, "required_user_rank": "", "cost_per_card": 80, "ss_guarantee_threshold": 0.7, "animation_settings": {"SS": "premium", "S": "special", "A": "normal", "B": "normal", "C": "normal"}}'::jsonb
),
(
  'ブラッキー超感謝祭',
  '還元率120%！ブラッキーVMAX PSA10 PROMO確定！',
  250,
  2500,
  true,
  NOW(),
  NOW() + INTERVAL '30 days',
  '/images/banners/real-gacha/S__44392521_0.jpg',
  ARRAY['BK-A001', 'BK-A002', 'BK-A003'],
  true,
  '{"total_stock": 1000, "is_free_points_only": false, "required_user_rank": "", "cost_per_card": 70, "ss_guarantee_threshold": 0.7, "animation_settings": {"SS": "premium", "S": "special", "A": "normal", "B": "normal", "C": "normal"}}'::jsonb
),
(
  'リーリエ×マリオピカチュウ 超豪華オリパ',
  'リーリエPSA10確定！マリオピカチュウ詰め合わせ！',
  400,
  4000,
  true,
  NOW(),
  NOW() + INTERVAL '30 days',
  '/images/banners/real-gacha/S__44392523_0.jpg',
  ARRAY['LM-P001', 'LM-P002', 'LM-P003'],
  true,
  '{"total_stock": 1000, "is_free_points_only": false, "required_user_rank": "", "cost_per_card": 100, "ss_guarantee_threshold": 0.7, "animation_settings": {"SS": "premium", "S": "special", "A": "normal", "B": "normal", "C": "normal"}}'::jsonb
);