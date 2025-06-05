'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { FilterSidebar } from './filter-sidebar'
import { Filter } from 'lucide-react'

interface MobileFilterDrawerProps {
  filtersCount?: number
}

export function MobileFilterDrawer({ filtersCount = 0 }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false)
  
  const handleClose = () => {
    setOpen(false)
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filters {filtersCount > 0 && `(${filtersCount})`}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-full max-w-xs">
        <FilterSidebar isMobile onClose={handleClose} />
      </SheetContent>
    </Sheet>
  )
} 