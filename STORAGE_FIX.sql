-- Fix for Supabase Storage Upload Issues
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete product images" ON storage.objects;

-- Create new, more permissive policies for the product-images bucket

-- 1. Allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 2. Allow uploads from both service role AND authenticated/anonymous users
CREATE POLICY "Allow uploads to product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated' OR
      auth.role() = 'anon'
    )
  );

-- 3. Allow updates from service role and authenticated users
CREATE POLICY "Allow updates to product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated'
    )
  );

-- 4. Allow deletions from service role and authenticated users
CREATE POLICY "Allow deletes from product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated'
    )
  );

-- Alternative: If you want to be more permissive during development
-- You can temporarily allow all operations (NOT recommended for production)
/*
DROP POLICY IF EXISTS "Allow uploads to product images" ON storage.objects;
CREATE POLICY "Allow all operations on product images" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images');
*/



