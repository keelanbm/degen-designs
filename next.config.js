/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['res.cloudinary.com', 'images.unsplash.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    env: {
      CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
    experimental: {
      serverComponentsExternalPackages: ['@prisma/client', '@prisma/engines'],
    },
    // Disable static optimization for API routes
    async rewrites() {
      return []
    },
  }
  
  module.exports = nextConfig