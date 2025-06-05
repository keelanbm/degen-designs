import { createClient } from '@supabase/supabase-js'

// Get environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Add debug logging to help identify issues
console.log('Supabase URL (masked):', supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : 'missing')
console.log('Supabase Anon Key (exists):', !!supabaseAnonKey)

// Check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  )
}

// Default URL to prevent crashes - this won't work for actual requests, but prevents immediate crashes
const fallbackUrl = 'https://placeholder-supabase-instance.supabase.co'

// Initialize the Supabase client with fallbacks
export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || 'placeholder-key'
)

// Storage bucket details
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
}

// Initialize Supabase bucket
export const initializeStorage = async () => {
  try {
    // Verify we have valid credentials before proceeding
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Cannot initialize storage: Missing Supabase credentials')
      return false
    }
    
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