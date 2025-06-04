import { getPrismaClient } from '@/lib/prisma'

async function main() {
  const prisma = getPrismaClient()
  
  try {
    // Clean existing data using raw SQL
    console.log('Cleaning existing data...')
    await prisma.$executeRaw`TRUNCATE TABLE "flow_steps" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "flows" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "images" CASCADE;`
    await prisma.$executeRaw`TRUNCATE TABLE "dapps" CASCADE;`
    
    console.log('Creating new data...')
    // Create GMX V2 dapp
    const gmx = await prisma.dapp.create({
      data: {
        name: 'GMX V2',
        slug: 'gmx-v2',
        description: 'The largest Perp DEX on Arbitrum, trade with up to 100x leverage',
        website: 'https://gmx.io',
        category: 'EXCHANGE',
        type: 'DEFI',
        featured: true,
        images: {
          create: [
            {
              url: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/gmx-limit.png',
              title: 'Limit Order',
              category: 'EXCHANGE',
              version: 'v2',
              order: 0
            },
            {
              url: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/gmx-market.png',
              title: 'Market Order',
              category: 'EXCHANGE',
              version: 'v2',
              order: 1
            },
            {
              url: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/gmx-dashboard.png',
              title: 'Dashboard',
              category: 'ANALYTICS',
              version: 'v2',
              order: 2
            }
          ]
        }
      }
    })

    // Create Jupiter dapp
    const jupiter = await prisma.dapp.create({
      data: {
        name: 'Jupiter',
        slug: 'jupiter',
        description: 'The key liquidity aggregator for Solana, providing the best swap rates',
        website: 'https://jup.ag',
        category: 'EXCHANGE',
        type: 'DEFI',
        featured: true,
        images: {
          create: [
            {
              url: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/jupiter-swap.png',
              title: 'Swap Interface',
              category: 'EXCHANGE',
              version: 'v6',
              order: 0
            },
            {
              url: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/jupiter-settings.png',
              title: 'Settings',
              category: 'OTHER',
              version: 'v6',
              order: 1
            }
          ]
        }
      }
    })

    console.log('Database seeded successfully:', {
      dapps: [
        { name: gmx.name, slug: gmx.slug },
        { name: jupiter.name, slug: jupiter.slug }
      ]
    })

  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 