import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function getImages(dappId?: string, category?: string) {
  const user = await getCurrentUser()
  
  const images = await db.image.findMany({
    where: {
      ...(dappId && { dappId }),
      ...(category && { category }),
    },
    include: {
      dapp: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  // Filter out premium images if user doesn't have access
  return images.filter((image) => {
    if (!image.isPremium) return true
    if (!user) return false
    if (user.isPremium) return true
    if (user.viewedImages < 3) return true
    return false
  })
}

export async function createImage(data: {
  url: string
  title?: string
  description?: string
  category?: string
  isPremium?: boolean
  order?: number
  dappId: string
}) {
  return await db.image.create({
    data: {
      url: data.url,
      title: data.title,
      description: data.description,
      category: data.category,
      isPremium: data.isPremium || false,
      order: data.order || 0,
      dappId: data.dappId,
    },
  })
}

export async function updateImage(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    isPremium?: boolean
    order?: number
  }
) {
  return await db.image.update({
    where: { id },
    data,
  })
}

export async function deleteImage(id: string) {
  return await db.image.delete({
    where: { id },
  })
}

export async function incrementUserViews(userId: string) {
  return await db.user.update({
    where: { id: userId },
    data: {
      viewedImages: {
        increment: 1,
      },
    },
  })
}