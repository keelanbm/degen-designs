import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { DappCategory, ImageFlow, UIElement } from '@prisma/client'

export async function getImages(dappId?: string, category?: DappCategory) {
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
  title?: string | null
  description?: string | null
  category?: DappCategory | null
  version?: string | null
  capturedAt?: Date | null
  isPremium?: boolean
  order?: number
  dappId: string
  flow?: ImageFlow | null
  uiElement?: UIElement | null
  tags?: string[]
}) {
  return await db.image.create({
    data: {
      url: data.url,
      title: data.title || undefined,
      description: data.description || undefined,
      category: data.category || undefined,
      version: data.version || undefined,
      capturedAt: data.capturedAt || undefined,
      isPremium: data.isPremium || false,
      order: data.order || 0,
      dappId: data.dappId,
      flow: data.flow || undefined,
      uiElement: data.uiElement || undefined,
      tags: data.tags || [],
    },
  })
}

export async function updateImage(
  id: string,
  data: {
    title?: string
    description?: string
    category?: DappCategory
    version?: string
    capturedAt?: Date
    isPremium?: boolean
    order?: number
    flow?: ImageFlow
    uiElement?: UIElement
    tags?: string[]
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