-- Fix Foreign Key Constraint to Allow Product Deletion
-- Run this in Supabase SQL Editor

-- Drop the existing foreign key constraint
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Recreate the foreign key with ON DELETE SET NULL
-- This allows products to be deleted even if they're in orders
ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;

-- Now products can be deleted and order_items will have NULL product_id
-- Orders will still show the price that was paid, just not the product details


