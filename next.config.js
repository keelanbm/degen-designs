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