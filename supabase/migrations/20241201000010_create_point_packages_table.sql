-- ポイントパッケージテーブルの作成
CREATE TABLE IF NOT EXISTS point_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  bonus INTEGER DEFAULT 0,
  price INTEGER NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_point_packages_active ON point_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_point_packages_sort ON point_packages(sort_order);

-- デフォルトパッケージの挿入
INSERT INTO point_packages (id, name, points, bonus, price, is_popular, sort_order) VALUES
  ('pack_150', '150ポイント', 150, 0, 120, false, 1),
  ('pack_500', '500ポイント+50ボーナス', 500, 50, 400, false, 2),
  ('pack_1000', '1000ポイント+150ボーナス', 1000, 150, 800, true, 3),
  ('pack_3000', '3000ポイント+600ボーナス', 3000, 600, 2400, false, 4),
  ('pack_5000', '5000ポイント+1200ボーナス', 5000, 1200, 4000, false, 5),
  ('pack_10000', '10000ポイント+3000ボーナス', 10000, 3000, 8000, false, 6)
ON CONFLICT (id) DO NOTHING;