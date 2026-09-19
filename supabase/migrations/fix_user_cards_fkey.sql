-- Fix user_cards foreign key to reference pokemon_cards instead of cards

-- Drop the incorrect foreign key
ALTER TABLE public.user_cards
  DROP CONSTRAINT IF EXISTS user_cards_card_id_fkey;

-- Add correct foreign key pointing to pokemon_cards
ALTER TABLE public.user_cards
  ADD CONSTRAINT user_cards_card_id_fkey
  FOREIGN KEY (card_id)
  REFERENCES public.pokemon_cards(id)
  ON DELETE CASCADE;

-- Verify the constraint
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_cards'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'card_id';
