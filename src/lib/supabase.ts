import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Storage bucket details
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
}

// Initialize Supabase bucket
export const initializeStorage = async () => {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const imagesBucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKETS.IMAGES)
    
    // Create the bucket if it doesn't exist
    if (!imagesBucketExists) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKETS.IMAGES, {
        public: true, // Allow public access to the bucket
      })
      
      if (error) {
        console.error('Error creating bucket:', error)
        return false
      }
      
      console.log('Created images bucket successfully')
    }
    
    return true
  } catch (error) {
    console.error('Error initializing Supabase storage:', error)
    return false
  }
}

// Supabase storage helper functions
export const getImageUrl = (path: string) => {
  const { data } = supabase.storage.from(STORAGE_BUCKETS.IMAGES).getPublicUrl(path)
  return data.publicUrl
}

// Auth helper to get current user from token
export const getUserFromToken = async (token: string) => {
  const { data, error } = await supabase.auth.getUser(token)
  if (error) throw error
  return data.user
} 