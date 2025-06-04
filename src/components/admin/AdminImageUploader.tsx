'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

const ADMIN_EMAIL = 'keelan.miskell@gmail.com'
const MAX_FILE_SIZE = 6 * 1024 * 1024 // 6MB

export default function AdminImageUploader() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [status, setStatus] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    title: '',
    flow: '',
    category: '',
    tags: '',
  })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      setStatus('Supabase environment variables are missing')
      return
    }
    
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email === ADMIN_EMAIL) setIsAdmin(true)
    })
    .catch(error => {
      console.error('Auth error:', error)
      setStatus('Authentication error')
    })
  }, [])

  if (!isAdmin) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setStatus('File too large. Max size is 6MB.')
      return
    }
    setStatus('Uploading...')
    setProgress(0)
    const { data, error } = await supabase.storage
      .from('dapp-images')
      .upload(`uploads/${Date.now()}-${file.name}`, file, {
        upsert: false,
      })
    if (error) {
      setStatus('Upload failed: ' + error.message)
      return
    }
    setProgress(100)
    const { data: urlData } = supabase.storage.from('dapp-images').getPublicUrl(`uploads/${Date.now()}-${file.name}`)
    const res = await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: urlData?.publicUrl,
        ...metadata,
        tags: metadata.tags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    })
    if (res.ok) setStatus('Upload successful!')
    else setStatus('Metadata save failed')
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Admin Image Upload</h2>
      <div
        className="border-2 border-dashed rounded p-4 text-center cursor-pointer mb-4"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {file ? file.name : 'Drag and drop or click to select an image'}
        <input
          type="file"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>
      <input
        className="w-full mb-2 p-2 border rounded"
        type="text"
        placeholder="Title"
        value={metadata.title}
        onChange={e => setMetadata({ ...metadata, title: e.target.value })}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        type="text"
        placeholder="Flow (e.g. ONBOARDING)"
        value={metadata.flow}
        onChange={e => setMetadata({ ...metadata, flow: e.target.value })}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        type="text"
        placeholder="Category (e.g. EXCHANGE)"
        value={metadata.category}
        onChange={e => setMetadata({ ...metadata, category: e.target.value })}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        type="text"
        placeholder="Tags (comma separated)"
        value={metadata.tags}
        onChange={e => setMetadata({ ...metadata, tags: e.target.value })}
      />
      <button
        className="w-full bg-blue-600 text-white py-2 rounded mt-2"
        onClick={handleUpload}
        disabled={!file}
      >
        Upload
      </button>
      {progress > 0 && <div className="h-2 bg-blue-200 rounded mt-2" style={{ width: `${progress}%` }} />}
      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  )
} 