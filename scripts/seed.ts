import { prisma } from '@/lib/prisma'

async function main() {
  try {
    // Create GMX V2 dapp
    const gmx = await prisma.dapp.upsert({
      where: { slug: 'gmx-v2' },
      update: {},
      create: {
        name: 'GMX V2',
        slug: 'gmx-v2',
        description: 'The largest Perp DEX on Arbitrum, trade with up to 100x leverage',
        website: 'https://gmx.io',
        category: 'DEFI',
        featured: true,
        images: {
          create: [
            {
              url: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/gmx-limit.png',
              title: 'Limit Order',
              category: 'Trading',
              version: 'v2',
              order: 0
            },
            {
              url: 'https://res.cloudinary.com/dgxzqy4kl/image/upload/v1709433600/gmx-market.png',
              title: 'Market Order',
              category: 'Trading',
              version: 'v2',
              order: 1
            }
          ]
        }
      }
    })

    console.log('Database seeded:', {
      dapp: gmx.name,
      slug: gmx.slug
    })

  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 