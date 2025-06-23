-- Add metadata column to gacha_products table
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add single_price and multi_price columns for flexible pricing
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS single_price INTEGER,
ADD COLUMN IF NOT EXISTS multi_price INTEGER;

-- Add date fields for limited time gachas
ALTER TABLE gacha_products
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Add featured cards for display
ALTER TABLE gacha_products
ADD COLUMN IF NOT EXISTS featured_card_ids UUID[];

-- Add guarantee settings
ALTER TABLE gacha_products
ADD COLUMN IF NOT EXISTS guarantee_sr_on_multi BOOLEAN DEFAULT FALSE;

-- Add banner image
ALTER TABLE gacha_products
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- Create index on dates for active gacha queries
CREATE INDEX IF NOT EXISTS idx_gacha_products_dates ON gacha_products(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_gacha_products_active ON gacha_products(is_active);

-- Sample metadata structure comment
COMMENT ON COLUMN gacha_products.metadata IS '
{
  "total_stock": 1000,
  "is_free_points_only": false,
  "required_user_rank": "gold",
  "cost_per_card": 50,
  "ss_guarantee_threshold": 0.7,
  "animation_settings": {
    "SS": "premium",
    "S": "special",
    "A": "normal",
    "B": "normal",
    "C": "normal"
  },
  "profit_info": {
    "totalRevenue": 150000,
    "totalCost": 50000,
    "profit": 100000,
    "profitRate": 0.67,
    "ssGuaranteeActive": false
  }
}';