export interface DappWithImages {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    website: string | null
    category: string | null
    featured: boolean
    createdAt: Date
    updatedAt: Date
    images: ImageWithDapp[]
    _count?: {
      images: number
    }
  }
  
  export interface ImageWithDapp {
    id: string
    url: string
    title: string | null
    description: string | null
    category: string | null
    isPremium: boolean
    order: number
    createdAt: Date
    updatedAt: Date
    dappId: string
    dapp?: {
      id: string
      name: string
      slug: string
    }
  }
  
  export interface FlowWithSteps {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    dappId: string
    steps: {
      id: string
      order: number
      image: ImageWithDapp
    }[]
  }
  
  export interface UserProfile {
    id: string
    clerkId: string
    email: string
    stripeCustomerId: string | null
    isPremium: boolean
    viewedImages: number
    createdAt: Date
    updatedAt: Date
  }