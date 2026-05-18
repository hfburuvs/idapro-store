-- Add country column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'us';

-- Create index for efficient country filtering
CREATE INDEX IF NOT EXISTS idx_products_country ON products(country);

-- Update existing products to have country='us' (default)
UPDATE products SET country = 'us' WHERE country IS NULL;

-- Verify
SELECT country, COUNT(*) FROM products GROUP BY country;
