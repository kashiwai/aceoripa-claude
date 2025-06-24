-- Add banner support to gacha_products table
ALTER TABLE gacha_products 
ADD COLUMN IF NOT EXISTS banner_image_url TEXT;

-- Create banners table for standalone banner management
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_type VARCHAR(50) DEFAULT 'gacha',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#FFFFFF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add unique constraint on banner title to prevent duplicates
ALTER TABLE banners 
ADD CONSTRAINT banners_title_unique UNIQUE (title);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banners_active_priority ON banners (is_active, priority);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_gacha_products_banner ON gacha_products (banner_image_url) WHERE banner_image_url IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE banners IS 'Standalone banner management for homepage carousel and promotional displays';
COMMENT ON COLUMN gacha_products.banner_image_url IS 'URL to banner image for gacha product display';
COMMENT ON COLUMN banners.link_type IS 'Type of link: gacha, external, page, etc.';
COMMENT ON COLUMN banners.priority IS 'Display priority (lower numbers = higher priority)';