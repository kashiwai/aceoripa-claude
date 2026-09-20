-- 同時リクエストによるポイント残高のマイナス化を防止する
-- (無料ガチャ等で同時に複数回消費リクエストが送られた際、check-then-act の
--  競合状態により残高が実質二重に減算され、マイナス残高になる不具合の再発防止)

CREATE OR REPLACE FUNCTION prevent_negative_points()
RETURNS TRIGGER AS $$
DECLARE
  locked_free_points INTEGER;
  locked_paid_points INTEGER;
BEGIN
  -- 対象ユーザーのuser_points行をロックして最新残高を取得(同時実行を直列化)
  SELECT free_points, paid_points INTO locked_free_points, locked_paid_points
  FROM user_points
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- user_points行が無いユーザーはこのチェック対象外(他の初期化処理に任せる)
    RETURN NEW;
  END IF;

  IF NEW.is_paid = false AND NEW.amount < 0 AND (locked_free_points + NEW.amount) < 0 THEN
    RAISE EXCEPTION 'ポイント残高が不足しています(無料ポイント残高: %, 必要: %)', locked_free_points, -NEW.amount
      USING ERRCODE = 'P0001';
  END IF;

  IF NEW.is_paid = true AND NEW.amount < 0 AND (locked_paid_points + NEW.amount) < 0 THEN
    RAISE EXCEPTION 'ポイント残高が不足しています(有料ポイント残高: %, 必要: %)', locked_paid_points, -NEW.amount
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_negative_points_trigger ON point_transactions;

CREATE TRIGGER prevent_negative_points_trigger
BEFORE INSERT ON point_transactions
FOR EACH ROW
EXECUTE FUNCTION prevent_negative_points();

COMMENT ON TRIGGER prevent_negative_points_trigger ON point_transactions IS '同時リクエストによるポイント残高のマイナス化を防止(行ロックで直列化)';
