#!/usr/bin/env tsx

import { PrismaClient, DappCategory, DappType, ImageFlow, UIElement } from '@prisma/client'
import { readdir, readFile } from 'fs/promises'
import { join, extname, basename } from 'path'
import { slugify } from '../src/lib/utils'

const db = new PrismaClient()

interface ImageUploadConfig {
  name: string
  description?: string
  website?: string
  category?: DappCategory
  type?: DappType
  version?: string
  capturedAt?: string
  imagesPath: string
  imageCategories?: Record<string, DappCategory>
  imageFlows?: Record<string, ImageFlow>
  imageUIElements?: Record<string, UIElement>
  imageTags?: Record<string, string[]>
  isPremium?: boolean
}

async function loadConfigs(): Promise<Record<string, ImageUploadConfig>> {
  try {
    const configFile = await readFile('./configs/dapps.json', 'utf8')
    return JSON.parse(configFile)
  } catch (error) {
    console.error('Error loading config file:', error)
    console.log('Make sure ./configs/dapps.json exists')
    process.exit(1)
  }
}

async function uploadImages(dappKey: string, config: ImageUploadConfig) {
  try {
    console.log(`Starting upload for ${config.name}...`)

    const dappSlug = slugify(config.name)
    
    let dapp = await db.dapp.findUnique({
      where: { slug: dappSlug }
    })

    if (!dapp) {
      dapp = await db.dapp.create({
        data: {
          name: config.name,
          slug: dappSlug,
          description: config.description,
          website: config.website,
          category: config.category,
          type: config.type,
          featured: true,
        }
      })
      console.log(`Created dapp: ${dapp.name}`)
    } else {
      console.log(`Found existing dapp: ${dapp.name}`)
    }

    const files = await readdir(config.imagesPath)
    const imageFiles = files.filter(file => 
      ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(file).toLowerCase())
    )

    console.log(`Found ${imageFiles.length} image files`)

    for (let i = 0; i < imageFiles.length; i++) {
      const filename = imageFiles[i]
      const filepath = join(config.imagesPath, filename)
      
      try {
        const imageUrl = await uploadToImageService(filepath, filename)
        
        const imageTitle = basename(filename, extname(filename))
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())

        const category = config.imageCategories?.[filename] as DappCategory | undefined
        const flow = config.imageFlows?.[filename] as ImageFlow | undefined
        const uiElement = config.imageUIElements?.[filename] as UIElement | undefined
        const tags = config.imageTags?.[filename] || []

        await db.image.create({
          data: {
            url: imageUrl,
            title: imageTitle,
            category: category,
            version: config.version || 'v1',
            capturedAt: config.capturedAt ? new Date(config.capturedAt) : new Date(),
            isPremium: config.isPremium || false,
            order: i,
            dappId: dapp.id,
            flow: flow,
            uiElement: uiElement,
            tags: tags,
          }
        })

        console.log(`✓ Uploaded: ${filename} -> ${imageTitle}`)
      } catch (error) {
        console.error(`✗ Failed to upload ${filename}:`, error)
      }
    }

    console.log(`\nCompleted upload for ${config.name}`)
    console.log(`Dapp URL: http://localhost:3000/${dappSlug}`)

  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    await db.$disconnect()
  }
}

async function uploadToImageService(filepath: string, filename: string): Promise<string> {
  // For local development: Use local file paths
  // Extract the folder name from the filepath to create the public URL
  const pathParts = filepath.split('/')
  const folderName = pathParts[pathParts.length - 2] // e.g., "uniswap-may-2025"
  
  // Return public URL that Next.js can serve
  return `/images/${folderName}/${filename}`
}

async function main() {
  const configs = await loadConfigs()
  const dappKey = process.argv[2]
  
  if (dappKey) {
    const config = configs[dappKey.toLowerCase()]
    
    if (config) {
      await uploadImages(dappKey, config)
    } else {
      console.error(`Configuration not found for: ${dappKey}`)
      console.log('Available dapps:', Object.keys(configs).join(', '))
    }
  } else {
    console.log('Usage: npm run upload-images <dapp-key>')
    console.log('Available dapps:', Object.keys(configs).join(', '))
    console.log('\nExample: npm run upload-images uniswap')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { uploadImages }