'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function NewDappPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    logoUrl: '',
    featured: false,
    type: '',
    category: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      
      // Auto-generate slug from name if slug is empty
      if (name === 'name' && !prev.slug) {
        newData.slug = slugify(value)
      }
      
      return newData
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, featured: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/dapps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create dapp')
      }
      
      toast.success('Dapp created successfully')
      router.push('/admin/dapps')
    } catch (error) {
      console.error('Error creating dapp:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/dapps">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dapps
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Add New Dapp</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Dapp Details</CardTitle>
          <CardDescription>
            Enter the details for the new dapp you want to add to the archive.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dapp name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="unique-slug"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL-friendly identifier (auto-generated from name)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Dapp Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dapp type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEFI">DeFi</SelectItem>
                      <SelectItem value="NFT">NFT</SelectItem>
                      <SelectItem value="SOCIAL">Social</SelectItem>
                      <SelectItem value="GAMING">Gaming</SelectItem>
                      <SelectItem value="TOOLS">Tools</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the dapp"
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LENDING">Lending</SelectItem>
                      <SelectItem value="EXCHANGE">Exchange</SelectItem>
                      <SelectItem value="MARKETPLACE">Marketplace</SelectItem>
                      <SelectItem value="WALLET">Wallet</SelectItem>
                      <SelectItem value="ANALYTICS">Analytics</SelectItem>
                      <SelectItem value="GOVERNANCE">Governance</SelectItem>
                      <SelectItem value="LAUNCHPAD">Launchpad</SelectItem>
                      <SelectItem value="BRIDGE">Bridge</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="space-y-0.5">
                    <Label htmlFor="featured">Featured Dapp</Label>
                    <div className="text-sm text-muted-foreground">
                      Display this dapp prominently on the homepage
                    </div>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
                  </>
                ) : (
                  'Create Dapp'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 