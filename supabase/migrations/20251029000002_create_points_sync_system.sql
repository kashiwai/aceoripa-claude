-- ポイント自動同期システム
-- point_transactionsからuser_pointsへの自動同期を保証

-- 1. ポイント同期関数の作成
CREATE OR REPLACE FUNCTION sync_user_points_from_transactions(p_user_id UUID)
RETURNS TABLE(
  old_free_points INTEGER,
  old_paid_points INTEGER,
  new_free_points INTEGER,
  new_paid_points INTEGER,
  difference INTEGER
) AS $$
DECLARE
  v_free_total INTEGER;
  v_paid_total INTEGER;
  v_current_free INTEGER;
  v_current_paid INTEGER;
BEGIN
  -- point_transactionsから実際の合計を計算
  SELECT
    COALESCE(SUM(CASE WHEN is_paid = false THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN is_paid = true THEN amount ELSE 0 END), 0)
  INTO v_free_total, v_paid_total
  FROM point_transactions
  WHERE user_id = p_user_id;

  -- 負の値にならないように調整
  v_free_total := GREATEST(v_free_total, 0);
  v_paid_total := GREATEST(v_paid_total, 0);

  -- 現在のuser_pointsの値を取得
  SELECT free_points, paid_points
  INTO v_current_free, v_current_paid
  FROM user_points
  WHERE user_id = p_user_id;

  -- user_pointsを更新
  UPDATE user_points
  SET
    free_points = v_free_total,
    paid_points = v_paid_total,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 結果を返す
  RETURN QUERY SELECT
    v_current_free AS old_free_points,
    v_current_paid AS old_paid_points,
    v_free_total AS new_free_points,
    v_paid_total AS new_paid_points,
    (v_free_total + v_paid_total) - (v_current_free + v_current_paid) AS difference;
END;
$$ LANGUAGE plpgsql;

-- 2. 全ユーザーのポイント同期関数
CREATE OR REPLACE FUNCTION sync_all_user_points()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  old_total INTEGER,
  new_total INTEGER,
  difference INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH sync_results AS (
    SELECT
      up.user_id,
      u.email,
      (up.free_points + up.paid_points) AS old_total,
      s.new_free_points + s.new_paid_points AS new_total,
      s.difference
    FROM user_points up
    LEFT JOIN users u ON u.id = up.user_id
    CROSS JOIN LATERAL sync_user_points_from_transactions(up.user_id) s
  )
  SELECT * FROM sync_results WHERE difference != 0;
END;
$$ LANGUAGE plpgsql;

-- 3. ポイント不整合検出関数
CREATE OR REPLACE FUNCTION detect_points_mismatch()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  user_points_total INTEGER,
  transactions_total INTEGER,
  difference INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.user_id,
    u.email,
    (up.free_points + up.paid_points) AS user_points_total,
    COALESCE(SUM(pt.amount), 0)::INTEGER AS transactions_total,
    (COALESCE(SUM(pt.amount), 0) - (up.free_points + up.paid_points))::INTEGER AS difference
  FROM user_points up
  LEFT JOIN users u ON u.id = up.user_id
  LEFT JOIN point_transactions pt ON pt.user_id = up.user_id
  GROUP BY up.user_id, u.email, up.free_points, up.paid_points
  HAVING (COALESCE(SUM(pt.amount), 0) - (up.free_points + up.paid_points)) != 0
  ORDER BY ABS(COALESCE(SUM(pt.amount), 0) - (up.free_points + up.paid_points)) DESC;
END;
$$ LANGUAGE plpgsql;

-- コメント
COMMENT ON FUNCTION sync_user_points_from_transactions IS 'point_transactionsからユーザーのポイントを再計算して同期';
COMMENT ON FUNCTION sync_all_user_points IS '全ユーザーのポイントを一括同期（差分があるユーザーのみ返す）';
COMMENT ON FUNCTION detect_points_mismatch IS 'user_pointsとpoint_transactionsの不整合を検出';
