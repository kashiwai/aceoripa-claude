-- Create user_cards table for storing user's obtained cards
CREATE TABLE IF NOT EXISTS public.user_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.pokemon_cards(id) ON DELETE CASCADE,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON public.user_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_obtained_at ON public.user_cards(obtained_at DESC);

-- Enable RLS
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own cards
CREATE POLICY "Users can view own cards"
  ON public.user_cards
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert cards (for gacha system)
CREATE POLICY "Service role can insert cards"
  ON public.user_cards
  FOR INSERT
  WITH CHECK (true);

-- Service role can update/delete cards
CREATE POLICY "Service role can update cards"
  ON public.user_cards
  FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete cards"
  ON public.user_cards
  FOR DELETE
  USING (true);

-- Grant permissions
GRANT ALL ON public.user_cards TO service_role;
GRANT SELECT ON public.user_cards TO authenticated;
