-- usersテーブルにfincode_customer_idカラムを追加
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS fincode_customer_id TEXT;