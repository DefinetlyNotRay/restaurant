# 🔧 Storage Upload Fix Guide

## ❌ The Problem

You're getting this error:

```
Storage upload error: Error [StorageApiError]: new row violates row-level security policy
```

This happens because:

1. Your Supabase storage bucket has Row Level Security (RLS) enabled
2. The current policies are too restrictive
3. The upload API was using the wrong Supabase client

## ✅ The Solution

I've fixed both issues:

### 1. Fixed the API Code ✅

- Changed from `supabase` (anon key) to `supabaseAdmin` (service role key)
- Service role has full permissions and bypasses RLS

### 2. Created Better Storage Policies

You need to run the SQL in `STORAGE_FIX.sql` in your Supabase dashboard.

## 🚀 Step-by-Step Fix

### Step 1: Update Storage Policies

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run this SQL:

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete product images" ON storage.objects;

-- Create new, more permissive policies
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow uploads to product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated' OR
      auth.role() = 'anon'
    )
  );

CREATE POLICY "Allow updates to product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated'
    )
  );

CREATE POLICY "Allow deletes from product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated'
    )
  );
```

### Step 2: Verify Your Bucket Exists

1. Go to **Storage** in Supabase dashboard
2. Make sure you have a bucket named `product-images`
3. If not, create it:
   - Click **New bucket**
   - Name: `product-images`
   - Make it **Public** ✅
   - Click **Create bucket**

### Step 3: Check Your Environment Variables

Make sure your `.env.local` has the correct Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is different from the anon key and has full permissions.

### Step 4: Test the Upload

1. Start your dev server: `npm run dev`
2. Go to `/admin/upload`
3. Try uploading an image
4. It should work now! ✅

## 🔍 What I Changed in the Code

### Before (❌ Broken):

```typescript
import { supabase } from "@/lib/supabase";

// This uses the anon key, which has limited permissions
const { data, error } = await supabase.storage
  .from("product-images")
  .upload(fileName, buffer);
```

### After (✅ Fixed):

```typescript
import { supabaseAdmin } from "@/lib/supabase";

// This uses the service role key, which bypasses RLS
const { data, error } = await supabaseAdmin.storage
  .from("product-images")
  .upload(fileName, buffer);
```

## 🛡️ Security Notes

- **Service Role Key**: Has full database access, only use in API routes (server-side)
- **Anon Key**: Limited permissions, safe to use in client-side code
- **RLS Policies**: Still protect your data, but now allow legitimate uploads

## 🚨 Alternative Quick Fix (Development Only)

If you want to temporarily disable RLS for testing:

```sql
-- ONLY FOR DEVELOPMENT - NOT PRODUCTION!
DROP POLICY IF EXISTS "Allow uploads to product images" ON storage.objects;
CREATE POLICY "Allow all operations on product images" ON storage.objects
  FOR ALL USING (bucket_id = 'product-images');
```

## ✅ Expected Result

After applying these fixes:

- ✅ Image uploads work
- ✅ Files are stored in `product-images` bucket
- ✅ Public URLs are generated correctly
- ✅ AI extraction can process the images
- ✅ Products appear in your menu

## 🔧 Troubleshooting

If it still doesn't work:

1. **Check bucket name**: Must be exactly `product-images`
2. **Verify service role key**: Should start with `eyJ...` and be very long
3. **Check bucket is public**: In Storage settings
4. **Restart dev server**: After changing `.env.local`

The upload should work perfectly now! 🎉



