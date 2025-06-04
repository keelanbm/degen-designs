'use client'

import { useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { initializeStorage } from '@/lib/supabase'

// Max file size: 6MB
const MAX_FILE_SIZE = 6 * 1024 * 1024

interface DappOption {
  id: string
  name: string
}

interface ImageUploadFormProps {
  dapps: DappOption[]
}

export function ImageUploadForm({ dapps }: ImageUploadFormProps) {
  const { user } = useUser()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dappId: '',
    category: '',
    version: '',
    flow: '',
    uiElement: '',
    tags: '',
    isPremium: false,
    order: 0,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Default URL to prevent crashes during initialization
  const fallbackUrl = 'https://placeholder-supabase-instance.supabase.co'

  const supabase = createClient(
    supabaseUrl || fallbackUrl,
    supabaseAnonKey || 'placeholder-key'
  )

  // Log environment status without exposing sensitive information
  console.log('ImageUploadForm - Supabase URL exists:', !!supabaseUrl)
  console.log('ImageUploadForm - Supabase Key exists:', !!supabaseAnonKey)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('File too large', {
          description: 'Maximum file size is 6MB'
        })
        return
      }
      
      setFile(selectedFile)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      
      // Check file size
      if (droppedFile.size > MAX_FILE_SIZE) {
        toast.error('File too large', {
          description: 'Maximum file size is 6MB'
        })
        return
      }
      
      setFile(droppedFile)
      const objectUrl = URL.createObjectURL(droppedFile)
      setPreview(objectUrl)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('No file selected', {
        description: 'Please select an image to upload'
      })
      return
    }
    
    if (!formData.dappId) {
      toast.error('Missing required field', {
        description: 'Please select a dapp'
      })
      return
    }
    
    setUploading(true)
    
    try {
      // Initialize Supabase bucket to ensure it exists
      const bucketInitialized = await initializeStorage()
      if (!bucketInitialized) {
        throw new Error('Failed to initialize storage bucket')
      }
      
      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `${formData.dappId}/${fileName}`
      
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file)
      
      if (uploadError) {
        throw new Error(uploadError.message)
      }
      
      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)
      
      // 3. Create record in database
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: publicUrl,
          title: formData.title || null,
          description: formData.description || null,
          dappId: formData.dappId,
          category: formData.category || null,
          version: formData.version || null,
          flow: formData.flow || null,
          uiElement: formData.uiElement || null,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
          isPremium: formData.isPremium,
          order: formData.order,
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create image record')
      }
      
      // Reset form
      setFile(null)
      setPreview(null)
      setFormData({
        title: '',
        description: '',
        dappId: formData.dappId, // Keep the same dapp selected for convenience
        category: '',
        version: '',
        flow: '',
        uiElement: '',
        tags: '',
        isPremium: false,
        order: 0,
      })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {/* Image Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          preview ? 'border-primary/50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          <div className="relative">
            <div className="relative w-full h-64 mb-4">
              <Image
                src={preview}
                alt="Upload preview"
                fill
                className="object-contain"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {file?.name} ({file && file.size ? (file.size / 1024 / 1024).toFixed(2) : 0} MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Drag and drop an image here</p>
            <p className="text-sm text-muted-foreground mb-4">
              PNG, JPG, WEBP up to 6MB
            </p>
            <Button type="button" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Metadata Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="dappId">Dapp *</Label>
            <Select
              value={formData.dappId}
              onValueChange={(value) => handleSelectChange('dappId', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a dapp" />
              </SelectTrigger>
              <SelectContent>
                {dapps.map((dapp) => (
                  <SelectItem key={dapp.id} value={dapp.id}>
                    {dapp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Image title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this image shows"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="e.g., v2.1"
            />
          </div>
        </div>

        <div className="space-y-4">
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

          <div>
            <Label htmlFor="flow">Flow</Label>
            <Select
              value={formData.flow}
              onValueChange={(value) => handleSelectChange('flow', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flow type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                <SelectItem value="TRADING">Trading</SelectItem>
                <SelectItem value="MINTING">Minting</SelectItem>
                <SelectItem value="PROFILE">Profile</SelectItem>
                <SelectItem value="SETTINGS">Settings</SelectItem>
                <SelectItem value="SWAP">Swap</SelectItem>
                <SelectItem value="SEND">Send</SelectItem>
                <SelectItem value="RECEIVE">Receive</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="uiElement">UI Element</Label>
            <Select
              value={formData.uiElement}
              onValueChange={(value) => handleSelectChange('uiElement', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select UI element type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TABLE">Table</SelectItem>
                <SelectItem value="DIALOG">Dialog</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="FORM">Form</SelectItem>
                <SelectItem value="CHART">Chart</SelectItem>
                <SelectItem value="MODAL">Modal</SelectItem>
                <SelectItem value="NAVIGATION">Navigation</SelectItem>
                <SelectItem value="BUTTON">Button</SelectItem>
                <SelectItem value="INPUT">Input</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Comma-separated tags"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPremium">Premium Content</Label>
              <div className="text-sm text-muted-foreground">
                Restrict to premium users
              </div>
            </div>
            <Switch
              id="isPremium"
              checked={formData.isPremium}
              onCheckedChange={(checked) => handleSwitchChange('isPremium', checked)}
            />
          </div>

          <div>
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min="0"
              value={formData.order.toString()}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={uploading || !file || !formData.dappId} className="w-full">
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
          </>
        ) : (
          'Upload Image'
        )}
      </Button>
    </form>
  )
} 