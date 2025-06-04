'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Filter, X } from 'lucide-react'

// Define the dapp types and categories based on the Prisma schema
const DAPP_TYPES = [
  { id: 'DEFI', label: 'DeFi' },
  { id: 'NFT', label: 'NFT' },
  { id: 'SOCIAL', label: 'Social' },
  { id: 'GAMING', label: 'Gaming' },
  { id: 'TOOLS', label: 'Tools' },
  { id: 'OTHER', label: 'Other' },
]

const DAPP_CATEGORIES = [
  { id: 'LENDING', label: 'Lending' },
  { id: 'EXCHANGE', label: 'Exchange' },
  { id: 'MARKETPLACE', label: 'Marketplace' },
  { id: 'WALLET', label: 'Wallet' },
  { id: 'ANALYTICS', label: 'Analytics' },
  { id: 'GOVERNANCE', label: 'Governance' },
  { id: 'LAUNCHPAD', label: 'Launchpad' },
  { id: 'BRIDGE', label: 'Bridge' },
  { id: 'OTHER', label: 'Other' },
]

interface FilterSidebarProps {
  className?: string
  isMobile?: boolean
  onClose?: () => void
}

export function FilterSidebar({ className = '', isMobile = false, onClose }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get current filter values from URL
  const currentTypes = searchParams.get('types')?.split(',') || []
  const currentCategories = searchParams.get('categories')?.split(',') || []
  
  // State for selected filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>(currentTypes)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentCategories)
  
  // Handle checkbox changes
  const handleTypeChange = (typeId: string, isChecked: boolean) => {
    setSelectedTypes(prev => 
      isChecked 
        ? [...prev, typeId] 
        : prev.filter(t => t !== typeId)
    )
  }
  
  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    setSelectedCategories(prev => 
      isChecked 
        ? [...prev, categoryId] 
        : prev.filter(c => c !== categoryId)
    )
  }
  
  // Apply filters to URL
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (selectedTypes.length > 0) {
      params.set('types', selectedTypes.join(','))
    }
    
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','))
    }
    
    router.push(`/?${params.toString()}`)
    
    if (isMobile && onClose) {
      onClose()
    }
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([])
    setSelectedCategories([])
    router.push('/')
    
    if (isMobile && onClose) {
      onClose()
    }
  }
  
  // Count total selected filters
  const totalFilters = selectedTypes.length + selectedCategories.length
  
  return (
    <div className={`bg-card p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters {totalFilters > 0 && `(${totalFilters})`}
        </h2>
        
        {isMobile && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Dapp Types */}
          <div>
            <h3 className="font-medium mb-3">Dapp Type</h3>
            <div className="space-y-2">
              {DAPP_TYPES.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`type-${type.id}`} 
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={(checked) => 
                      handleTypeChange(type.id, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`type-${type.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Dapp Categories */}
          <div>
            <h3 className="font-medium mb-3">Category</h3>
            <div className="space-y-2">
              {DAPP_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category.id}`} 
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category.id, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="mt-6 space-y-2">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  )
} 