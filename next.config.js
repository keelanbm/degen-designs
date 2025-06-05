/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Allow Supabase storage URLs
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Allow serving local images from public directory
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Optimize for Vercel deployment
  outputFileTracing: true,
  // Disable static optimization for pages that use database
  async rewrites() {
    return []
  },
  // Ensure proper environment variable handling
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig