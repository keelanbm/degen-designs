'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

// Define the flow and UI element types based on the Prisma schema
const FLOW_TYPES = [
  { id: 'ONBOARDING', label: 'Onboarding' },
  { id: 'TRADING', label: 'Trading' },
  { id: 'MINTING', label: 'Minting' },
  { id: 'PROFILE', label: 'Profile' },
  { id: 'SETTINGS', label: 'Settings' },
  { id: 'SWAP', label: 'Swap' },
  { id: 'SEND', label: 'Send' },
  { id: 'RECEIVE', label: 'Receive' },
  { id: 'OTHER', label: 'Other' },
]

const UI_ELEMENTS = [
  { id: 'TABLE', label: 'Table' },
  { id: 'DIALOG', label: 'Dialog' },
  { id: 'CARD', label: 'Card' },
  { id: 'FORM', label: 'Form' },
  { id: 'CHART', label: 'Chart' },
  { id: 'MODAL', label: 'Modal' },
  { id: 'NAVIGATION', label: 'Navigation' },
  { id: 'BUTTON', label: 'Button' },
  { id: 'INPUT', label: 'Input' },
  { id: 'OTHER', label: 'Other' },
]

interface ImageFilterProps {
  images: {
    id: string
    flow: string | null
    uiElement: string | null
    [key: string]: any
  }[]
  onFilter: (filteredImages: any[]) => void
}

export function ImageFilter({ images, onFilter }: ImageFilterProps) {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  
  const handleFlowSelect = (flowId: string) => {
    // Toggle selection if the same flow is clicked again
    const newFlow = selectedFlow === flowId ? null : flowId
    setSelectedFlow(newFlow)
    applyFilters(newFlow, selectedElement)
  }
  
  const handleElementSelect = (elementId: string) => {
    // Toggle selection if the same element is clicked again
    const newElement = selectedElement === elementId ? null : elementId
    setSelectedElement(newElement)
    applyFilters(selectedFlow, newElement)
  }
  
  const applyFilters = (flow: string | null, element: string | null) => {
    let filteredImages = [...images]
    
    if (flow) {
      filteredImages = filteredImages.filter(img => img.flow === flow)
    }
    
    if (element) {
      filteredImages = filteredImages.filter(img => img.uiElement === element)
    }
    
    onFilter(filteredImages)
  }
  
  const clearFilters = () => {
    setSelectedFlow(null)
    setSelectedElement(null)
    onFilter(images)
  }
  
  // Count active filters
  const activeFiltersCount = (selectedFlow ? 1 : 0) + (selectedElement ? 1 : 0)
  
  return (
    <div className="flex items-center gap-2 mb-6">
      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter Images</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Flow Type
            </DropdownMenuLabel>
            {FLOW_TYPES.map((flow) => (
              <DropdownMenuItem 
                key={flow.id}
                onClick={() => handleFlowSelect(flow.id)}
                className={selectedFlow === flow.id ? 'bg-muted' : ''}
              >
                {flow.label}
                {selectedFlow === flow.id && (
                  <span className="ml-auto">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              UI Element
            </DropdownMenuLabel>
            {UI_ELEMENTS.map((element) => (
              <DropdownMenuItem 
                key={element.id}
                onClick={() => handleElementSelect(element.id)}
                className={selectedElement === element.id ? 'bg-muted' : ''}
              >
                {element.label}
                {selectedElement === element.id && (
                  <span className="ml-auto">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={clearFilters} disabled={activeFiltersCount === 0}>
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Active Filters Display */}
      {selectedFlow && (
        <Badge 
          variant="secondary"
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleFlowSelect(selectedFlow)}
        >
          {FLOW_TYPES.find(f => f.id === selectedFlow)?.label || selectedFlow}
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
            ✕
          </Button>
        </Badge>
      )}
      
      {selectedElement && (
        <Badge 
          variant="outline"
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleElementSelect(selectedElement)}
        >
          {UI_ELEMENTS.find(e => e.id === selectedElement)?.label || selectedElement}
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
            ✕
          </Button>
        </Badge>
      )}
    </div>
  )
} 