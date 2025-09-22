import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Set up anonymous session for uploads (since we're using anon key)
const setupSession = async () => {
  try {
    // Sign in anonymously if not already authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('Anonymous auth failed, using anon key only:', error.message);
      }
    }
  } catch (error) {
    console.warn('Session setup failed, using anon key only:', error);
  }
};

// Call setup on import
setupSession();

// Helper function to upload images
export const uploadProductImages = async (
  files: File[], 
  productSku: string,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  if (files.length === 0) return [];
  
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Report progress if callback provided
    if (onProgress) {
      onProgress(Math.round(((i) / files.length) * 100));
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error(`File ${file.name} is not a valid image type`);
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${productSku}-${i + 1}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('new row violates row-level security policy')) {
        throw new Error('Storage permission denied. Please check Supabase RLS policies.');
      } else if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket "product-images" not found. Please create it in Supabase.');
      } else if (error.message.includes('The resource already exists')) {
        throw new Error(`File already exists: ${file.name}. Please try again.`);
      } else {
        throw new Error(`Failed to upload image "${file.name}": ${error.message}`);
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error(`Failed to get public URL for uploaded image: ${file.name}`);
    }

    uploadedUrls.push(publicUrl);
  }
  
  // Report completion
  if (onProgress) {
    onProgress(100);
  }

  return uploadedUrls;
};

// Helper function to delete images
export const deleteProductImages = async (imageUrls: string[]): Promise<void> => {
  const filePaths = imageUrls.map(url => {
    const urlParts = url.split('/');
    return `products/${urlParts[urlParts.length - 1]}`;
  });

  const { error } = await supabase.storage
    .from('product-images')
    .remove(filePaths);

  if (error) {
    console.error('Error deleting files:', error);
    throw new Error('Failed to delete images');
  }
};