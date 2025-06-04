import { prisma } from '@/lib/prisma'
import DappManagementClient from '@/components/admin/dapp-management-client'

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDapps() {
  try {
    const dapps = await prisma.dapp.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        website: true,
        featured: true,
        createdAt: true,
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Serialize dates for client components
    const serializedDapps = dapps.map(dapp => ({
      ...dapp,
      createdAt: dapp.createdAt.toISOString()
    }))
    
    return serializedDapps
  } catch (error) {
    console.error('Error fetching dapps:', error)
    return []
  }
}

export default async function DappManagementPage() {
  const dapps = await getDapps()
  return <DappManagementClient dapps={dapps} />
} 