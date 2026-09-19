-- Fix user_cards table to allow duplicate cards
-- Remove unique constraint that prevents users from having multiple copies of the same card

-- Drop the unique constraint
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;

-- Add a non-unique index for performance
CREATE INDEX IF NOT EXISTS idx_user_cards_user_card ON user_cards(user_id, card_id);

-- Verify the change
COMMENT ON TABLE user_cards IS 'Stores user card collection. Users can have multiple copies of the same card.';
