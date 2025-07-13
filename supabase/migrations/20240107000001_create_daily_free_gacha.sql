-- Create daily_free_gacha_logs table for tracking daily free gacha usage
CREATE TABLE IF NOT EXISTS daily_free_gacha_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gacha_product_id UUID NOT NULL REFERENCES gacha_products(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_free_gacha_user_reset ON daily_free_gacha_logs(user_id, reset_date);
CREATE INDEX IF NOT EXISTS idx_daily_free_gacha_gacha_product ON daily_free_gacha_logs(gacha_product_id);
CREATE INDEX IF NOT EXISTS idx_daily_free_gacha_used_at ON daily_free_gacha_logs(used_at);

-- Add unique constraint to prevent multiple free gacha per day per user per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_free_gacha_unique 
ON daily_free_gacha_logs(user_id, gacha_product_id, reset_date);

-- Add metadata column to gacha_products for free gacha settings if not exists
DO $$ 
BEGIN
    -- Check if is_daily_free_gacha column exists, if not add it to metadata
    -- Since metadata is JSONB, we'll use it to store free gacha settings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gacha_products' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE gacha_products ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create function to check if user can use daily free gacha
CREATE OR REPLACE FUNCTION can_use_daily_free_gacha(
    p_user_id UUID,
    p_gacha_product_id UUID,
    p_reset_hour INTEGER DEFAULT 4  -- 4 AM JST reset time
) RETURNS BOOLEAN AS $$
DECLARE
    reset_time TIMESTAMP WITH TIME ZONE;
    last_used_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate today's reset time (4 AM JST)
    reset_time := (CURRENT_DATE + INTERVAL '1 day' * 0 + INTERVAL '1 hour' * p_reset_hour) AT TIME ZONE 'Asia/Tokyo';
    
    -- If current time is before reset time, use yesterday's reset time
    IF CURRENT_TIMESTAMP < reset_time THEN
        reset_time := reset_time - INTERVAL '1 day';
    END IF;
    
    -- Check if user has used free gacha after the last reset
    SELECT used_at INTO last_used_at
    FROM daily_free_gacha_logs
    WHERE user_id = p_user_id 
      AND gacha_product_id = p_gacha_product_id
      AND used_at >= reset_time
    ORDER BY used_at DESC
    LIMIT 1;
    
    -- Return true if no usage found after reset time
    RETURN (last_used_at IS NULL);
END;
$$ LANGUAGE plpgsql;

-- Create function to record daily free gacha usage
CREATE OR REPLACE FUNCTION record_daily_free_gacha_usage(
    p_user_id UUID,
    p_gacha_product_id UUID
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
    current_reset_date DATE;
BEGIN
    -- Calculate reset date (if current time is before 4 AM, use previous date)
    IF EXTRACT(HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo') < 4 THEN
        current_reset_date := (CURRENT_DATE - INTERVAL '1 day')::DATE;
    ELSE
        current_reset_date := CURRENT_DATE;
    END IF;
    
    -- Insert usage log
    INSERT INTO daily_free_gacha_logs (user_id, gacha_product_id, reset_date)
    VALUES (p_user_id, p_gacha_product_id, current_reset_date)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE daily_free_gacha_logs IS '1日1回無料ガチャの利用記録テーブル';
COMMENT ON FUNCTION can_use_daily_free_gacha IS 'ユーザーが1日1回無料ガチャを利用可能かチェック';
COMMENT ON FUNCTION record_daily_free_gacha_usage IS '1日1回無料ガチャの利用を記録';