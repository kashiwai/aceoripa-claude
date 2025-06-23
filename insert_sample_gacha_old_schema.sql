-- 古いスキーマに合わせてサンプルガチャデータを挿入

INSERT INTO gacha_products (
  name,
  description,
  price,
  currency,
  card_count,
  bonus_cards,
  is_active
) VALUES 
(
  'ピカチュウ大祭り',
  '還元率97%！ポンチョを着たピカチュウPSA10確定！',
  150,
  'JPY',
  1,
  0,
  true
),
(
  'ナンジャモ大量発生オリパ',
  '還元率100%超え！ナンジャモSAR PSA10確定！',
  200,
  'JPY',
  1,
  0,
  true
),
(
  'リザードン祭盤 炎のプレミアオリパ',
  '還元率97%！リザードンVMAX HR PSA10確定！',
  300,
  'JPY',
  1,
  0,
  true
),
(
  'ブラッキー超感謝祭',
  '還元率120%！ブラッキーVMAX PSA10 PROMO確定！',
  250,
  'JPY',
  1,
  0,
  true
),
(
  'リーリエ×マリオピカチュウ 超豪華オリパ',
  'リーリエPSA10確定！マリオピカチュウ詰め合わせ！',
  400,
  'JPY',
  1,
  0,
  true
);