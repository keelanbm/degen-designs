'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

// Define the dapp types and categories based on the Prisma schema
const DAPP_TYPES = {
  'DEFI': 'DeFi',
  'NFT': 'NFT',
  'SOCIAL': 'Social',
  'GAMING': 'Gaming',
  'TOOLS': 'Tools',
  'OTHER': 'Other',
}

const DAPP_CATEGORIES = {
  'LENDING': 'Lending',
  'EXCHANGE': 'Exchange',
  'MARKETPLACE': 'Marketplace',
  'WALLET': 'Wallet',
  'ANALYTICS': 'Analytics',
  'GOVERNANCE': 'Governance',
  'LAUNCHPAD': 'Launchpad',
  'BRIDGE': 'Bridge',
  'OTHER': 'Other',
}

interface ActiveFiltersProps {
  className?: string
}

export function ActiveFilters({ className = '' }: ActiveFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const activeTypes = searchParams.get('types')?.split(',') || []
  const activeCategories = searchParams.get('categories')?.split(',') || []
  
  const totalFilters = activeTypes.length + activeCategories.length
  
  if (totalFilters === 0) {
    return null
  }
  
  const removeFilter = (filterType: 'types' | 'categories', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (filterType === 'types') {
      const newTypes = activeTypes.filter(t => t !== value)
      if (newTypes.length > 0) {
        params.set('types', newTypes.join(','))
      } else {
        params.delete('types')
      }
    } else {
      const newCategories = activeCategories.filter(c => c !== value)
      if (newCategories.length > 0) {
        params.set('categories', newCategories.join(','))
      } else {
        params.delete('categories')
      }
    }
    
    router.push(`/?${params.toString()}`)
  }
  
  const clearAllFilters = () => {
    router.push('/')
  }
  
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {activeTypes.map((type) => (
        <Badge 
          key={`type-${type}`}
          variant="secondary"
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => removeFilter('types', type)}
        >
          {DAPP_TYPES[type as keyof typeof DAPP_TYPES] || type}
          <X className="h-3 w-3" />
        </Badge>
      ))}
      
      {activeCategories.map((category) => (
        <Badge 
          key={`category-${category}`}
          variant="outline"
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => removeFilter('categories', category)}
        >
          {DAPP_CATEGORIES[category as keyof typeof DAPP_CATEGORIES] || category}
          <X className="h-3 w-3" />
        </Badge>
      ))}
      
      {totalFilters > 1 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs"
          onClick={clearAllFilters}
        >
          Clear all
        </Button>
      )}
    </div>
  )
} 