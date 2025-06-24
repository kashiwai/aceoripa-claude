-- バナー設定テーブルの修正
-- 設定は1レコードのみ存在するようにする

-- 既存のデータがない場合のみデフォルト設定を挿入
DO $$
BEGIN
    -- square_banner_settings にデータがない場合のみ挿入
    IF NOT EXISTS (SELECT 1 FROM square_banner_settings LIMIT 1) THEN
        INSERT INTO square_banner_settings (id, show_square_banners, created_at, updated_at) 
        VALUES (gen_random_uuid(), true, NOW(), NOW());
    END IF;
    
    -- campaign_banner_settings にデータがない場合のみ挿入
    IF NOT EXISTS (SELECT 1 FROM campaign_banner_settings LIMIT 1) THEN
        INSERT INTO campaign_banner_settings (id, show_all_banners, created_at, updated_at) 
        VALUES (gen_random_uuid(), true, NOW(), NOW());
    END IF;
END $$;

-- ユニーク制約を追加（設定が複数作られないように）
DO $$
BEGIN
    -- square_banner_settings の処理
    -- single_row_enforcer カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'square_banner_settings' 
        AND column_name = 'single_row_enforcer'
    ) THEN
        ALTER TABLE square_banner_settings ADD COLUMN single_row_enforcer boolean DEFAULT true;
    END IF;
    
    -- 既存のデータがある場合、single_row_enforcer を更新
    UPDATE square_banner_settings SET single_row_enforcer = true;
    
    -- 制約が存在しない場合のみ追加
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'square_banner_settings_single_row'
    ) THEN
        -- 複数レコードがある場合は最新の1件以外を削除
        DELETE FROM square_banner_settings 
        WHERE id NOT IN (
            SELECT id FROM square_banner_settings 
            ORDER BY created_at DESC 
            LIMIT 1
        );
        
        ALTER TABLE square_banner_settings ADD CONSTRAINT square_banner_settings_single_row UNIQUE (single_row_enforcer);
    END IF;
END $$;

DO $$
BEGIN
    -- campaign_banner_settings の処理
    -- single_row_enforcer カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'campaign_banner_settings' 
        AND column_name = 'single_row_enforcer'
    ) THEN
        ALTER TABLE campaign_banner_settings ADD COLUMN single_row_enforcer boolean DEFAULT true;
    END IF;
    
    -- 既存のデータがある場合、single_row_enforcer を更新
    UPDATE campaign_banner_settings SET single_row_enforcer = true;
    
    -- 制約が存在しない場合のみ追加
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_banner_settings_single_row'
    ) THEN
        -- 複数レコードがある場合は最新の1件以外を削除
        DELETE FROM campaign_banner_settings 
        WHERE id NOT IN (
            SELECT id FROM campaign_banner_settings 
            ORDER BY created_at DESC 
            LIMIT 1
        );
        
        ALTER TABLE campaign_banner_settings ADD CONSTRAINT campaign_banner_settings_single_row UNIQUE (single_row_enforcer);
    END IF;
END $$;