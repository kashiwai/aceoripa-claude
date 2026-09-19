-- user_pointsテーブルのNULL問題を根本的に解決
-- paid_pointsとfree_pointsをNOT NULL制約に変更し、デフォルト値を設定

-- 1. 既存のNULL値を0に更新
UPDATE user_points
SET paid_points = 0
WHERE paid_points IS NULL;

UPDATE user_points
SET free_points = 0
WHERE free_points IS NULL;

-- 2. NOT NULL制約を追加してデフォルト値を設定
ALTER TABLE user_points
ALTER COLUMN paid_points SET DEFAULT 0,
ALTER COLUMN paid_points SET NOT NULL;

ALTER TABLE user_points
ALTER COLUMN free_points SET DEFAULT 0,
ALTER COLUMN free_points SET NOT NULL;

-- 3. ポイント自動同期トリガーを作成（point_transactionsの変更時にuser_pointsを自動更新）
CREATE OR REPLACE FUNCTION sync_user_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- トランザクションの合計を計算してuser_pointsを更新
  UPDATE user_points
  SET
    free_points = (
      SELECT COALESCE(SUM(amount), 0)
      FROM point_transactions
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND is_paid = false
    ),
    paid_points = (
      SELECT COALESCE(SUM(amount), 0)
      FROM point_transactions
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND is_paid = true
    ),
    updated_at = NOW()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 既存のトリガーを削除（存在する場合）
DROP TRIGGER IF EXISTS sync_points_after_transaction ON point_transactions;

-- 新しいトリガーを作成
CREATE TRIGGER sync_points_after_transaction
AFTER INSERT OR UPDATE OR DELETE ON point_transactions
FOR EACH ROW
EXECUTE FUNCTION sync_user_points_trigger();

-- コメント
COMMENT ON TRIGGER sync_points_after_transaction ON point_transactions IS 'point_transactionsの変更時にuser_pointsを自動同期';
COMMENT ON FUNCTION sync_user_points_trigger IS 'point_transactionsからuser_pointsへの自動同期トリガー関数';
