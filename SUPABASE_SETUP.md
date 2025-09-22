# Supabase Storage Setup for Product Images

## 1. Create Storage Bucket

First, go to your Supabase dashboard → Storage and create a new bucket named `product-images`.

## 2. RLS Policies for Product Images Storage

Execute these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Policy 2: Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

## 3. Bucket Configuration

Make sure your bucket is configured with these settings:

- **Name**: `product-images`
- **Public**: `true` (for read access)
- **File size limit**: `10MB` (recommended)
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `image/jpg`

## 4. Test the Setup

After applying the policies, test with this simple upload:

```javascript
// Test upload in browser console
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('test/test-image.jpg', file);

console.log('Upload result:', { data, error });
```

## 5. Alternative: Simple Public Bucket (Less Secure)

If you want a simpler setup without authentication requirements:

```sql
-- Remove existing policies first
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Create simple public access policy
CREATE POLICY "Public access for product images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');
```

## 6. Verify Policies

Check if policies are applied correctly:

```sql
-- List all policies for storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Troubleshooting

### Common Issues:

1. **403 Forbidden**: Check if RLS policies allow your operation
2. **Bucket not found**: Ensure bucket name matches exactly (`product-images`)
3. **Upload fails**: Verify file size and MIME type restrictions
4. **Public URL not accessible**: Ensure bucket is public and read policy exists

### Debug Commands:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check bucket configuration
SELECT * FROM storage.buckets WHERE name = 'product-images';
```