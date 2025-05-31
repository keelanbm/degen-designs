'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Lock, Check, Star } from 'lucide-react'

interface PaywallProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Paywall({ open, onOpenChange }: PaywallProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    // For now, just show an alert since we don't have Clerk set up
    alert('Payment functionality will be available when Clerk is configured!')
    setLoading(false)
  }

  const features = [
    'Unlimited access to all premium designs',
    'High-resolution image downloads',
    'Flow diagrams and user journeys',
    'Early access to new content',
    'Lifetime access - pay once, use forever'
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Unlock Premium Content</DialogTitle>
          <DialogDescription>
            You've reached your free limit of 3 images. Upgrade for unlimited access to all premium dapp designs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Lifetime Access</h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-2xl font-bold">$5</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              One-time payment, lifetime access
            </p>
            
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'Upgrade Now - $5'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}