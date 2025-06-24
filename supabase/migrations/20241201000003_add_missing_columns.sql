-- 既存のテーブルに不足しているカラムを追加

-- transactions テーブルに type カラムを追加
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'type'
    ) THEN
        ALTER TABLE transactions ADD COLUMN type TEXT DEFAULT 'payment';
        
        -- 既存のデータに適切なtypeを設定
        UPDATE transactions SET type = 'payment' WHERE type IS NULL;
        
        -- NOT NULL制約を追加
        ALTER TABLE transactions ALTER COLUMN type SET NOT NULL;
    END IF;
END $$;

-- gacha_products テーブルとの関連を修正
DO $$
BEGIN
    -- product_id カラムの名前を gacha_product_id に変更（存在する場合）
    IF EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'product_id'
    ) AND NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'gacha_product_id'
    ) THEN
        ALTER TABLE transactions RENAME COLUMN product_id TO gacha_product_id;
    END IF;
END $$;

-- 必要なインデックスを作成
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);