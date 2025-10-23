-- Migration: Add atomic point allocation functions to prevent race conditions
-- Issue: Critical #1 - Point double-allocation bug fix
-- Date: 2025-10-21

-- Function: Atomically increment paid_points for a user
-- This prevents race conditions when multiple concurrent payment requests
-- try to update the same user's points
CREATE OR REPLACE FUNCTION increment_paid_points(
  p_user_id UUID,
  p_points_to_add INTEGER
)
RETURNS TABLE(new_points INTEGER) AS $$
DECLARE
  v_new_points INTEGER;
BEGIN
  -- Perform atomic update with row-level locking
  UPDATE users
  SET paid_points = COALESCE(paid_points, 0) + p_points_to_add,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING paid_points INTO v_new_points;

  -- Check if user was found and updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  RETURN QUERY SELECT v_new_points;
END;
$$ LANGUAGE plpgsql;

-- Function: Atomically decrement points (for gacha execution)
-- Ensures points are only deducted if sufficient balance exists
CREATE OR REPLACE FUNCTION decrement_user_points(
  p_user_id UUID,
  p_free_points_to_deduct INTEGER,
  p_paid_points_to_deduct INTEGER
)
RETURNS TABLE(
  new_free_points INTEGER,
  new_paid_points INTEGER,
  success BOOLEAN
) AS $$
DECLARE
  v_current_free_points INTEGER;
  v_current_paid_points INTEGER;
  v_new_free_points INTEGER;
  v_new_paid_points INTEGER;
BEGIN
  -- Get current points with row-level lock (FOR UPDATE)
  SELECT free_points, paid_points
  INTO v_current_free_points, v_current_paid_points
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user_points record exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User points record not found: %', p_user_id;
  END IF;

  -- Validate sufficient balance
  IF (COALESCE(v_current_free_points, 0) < p_free_points_to_deduct) OR
     (COALESCE(v_current_paid_points, 0) < p_paid_points_to_deduct) THEN
    -- Return failure without updating
    RETURN QUERY SELECT
      COALESCE(v_current_free_points, 0),
      COALESCE(v_current_paid_points, 0),
      FALSE;
    RETURN;
  END IF;

  -- Perform atomic deduction
  UPDATE user_points
  SET
    free_points = COALESCE(free_points, 0) - p_free_points_to_deduct,
    paid_points = COALESCE(paid_points, 0) - p_paid_points_to_deduct,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING free_points, paid_points
  INTO v_new_free_points, v_new_paid_points;

  -- Return success with new balances
  RETURN QUERY SELECT
    v_new_free_points,
    v_new_paid_points,
    TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Rollback points after gacha failure
-- Used when card allocation fails after points have been deducted
CREATE OR REPLACE FUNCTION rollback_user_points(
  p_user_id UUID,
  p_free_points_to_add INTEGER,
  p_paid_points_to_add INTEGER
)
RETURNS TABLE(
  new_free_points INTEGER,
  new_paid_points INTEGER
) AS $$
DECLARE
  v_new_free_points INTEGER;
  v_new_paid_points INTEGER;
BEGIN
  -- Perform atomic increment to restore points
  UPDATE user_points
  SET
    free_points = COALESCE(free_points, 0) + p_free_points_to_add,
    paid_points = COALESCE(paid_points, 0) + p_paid_points_to_add,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING free_points, paid_points
  INTO v_new_free_points, v_new_paid_points;

  -- Check if user_points record exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User points record not found: %', p_user_id;
  END IF;

  RETURN QUERY SELECT v_new_free_points, v_new_paid_points;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_paid_points(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_user_points(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_user_points(UUID, INTEGER, INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION increment_paid_points IS 'Atomically increments paid_points for a user. Prevents race conditions in concurrent payment processing.';
COMMENT ON FUNCTION decrement_user_points IS 'Atomically decrements user points with balance validation. Returns success=false if insufficient balance.';
COMMENT ON FUNCTION rollback_user_points IS 'Restores points after gacha execution failure. Used for rollback when card allocation fails.';
