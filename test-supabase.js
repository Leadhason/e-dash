// Test script for Supabase storage setup
// Run this in your browser console after setting up the bucket and policies

import { supabase } from './client/src/lib/supabase.ts';

async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Setup...\n');
  
  try {
    // Test 1: Check if bucket exists
    console.log('1️⃣ Checking if product-images bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return;
    }
    
    const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images');
    if (!productImagesBucket) {
      console.error('❌ Bucket "product-images" not found. Please create it in Supabase dashboard.');
      return;
    }
    console.log('✅ Bucket "product-images" found');
    
    // Test 2: Check bucket permissions
    console.log('\n2️⃣ Testing bucket permissions...');
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1 });
    
    if (listError) {
      console.error('❌ Failed to list files (check read permissions):', listError);
    } else {
      console.log('✅ Read permissions working');
    }
    
    // Test 3: Test upload (create a small test file)
    console.log('\n3️⃣ Testing file upload...');
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(`test/${testFileName}`, testFile);
    
    if (uploadError) {
      console.error('❌ Upload failed (check write permissions):', uploadError);
      
      if (uploadError.message.includes('row-level security policy')) {
        console.log('\n🔧 RLS Policy Issue Detected!');
        console.log('Run this SQL in your Supabase SQL Editor:');
        console.log(`
CREATE POLICY "Allow public uploads for testing" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public reads for testing" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
        `);
      }
    } else {
      console.log('✅ Upload successful');
      
      // Test 4: Get public URL
      console.log('\n4️⃣ Testing public URL generation...');
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(`test/${testFileName}`);
      
      console.log('✅ Public URL generated:', publicUrl);
      
      // Test 5: Cleanup - delete test file
      console.log('\n5️⃣ Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from('product-images')
        .remove([`test/${testFileName}`]);
      
      if (deleteError) {
        console.warn('⚠️ Failed to delete test file:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }
    
    console.log('\n🎉 Supabase storage test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Export for manual testing
window.testSupabaseStorage = testSupabaseStorage;

console.log('📋 To test your Supabase setup, run: testSupabaseStorage()');