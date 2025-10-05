"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface MediaUploadProps {
  onUpload: (urls: string[]) => void
  currentUrls?: string[]
  maxFiles?: number
  accept?: string
  title: string
  description: string
  required?: boolean
}

export function MediaUpload({ 
  onUpload, 
  currentUrls = [], 
  maxFiles = 10,
  accept = "image/*",
  title,
  description,
  required = false
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (currentUrls.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    try {
      for (const file of acceptedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        newUrls.push(result.url)
      }

      onUpload([...currentUrls, ...newUrls])
      toast.success(`${acceptedFiles.length} file(s) uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }, [currentUrls, maxFiles, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === "image/*" ? { 'image/*': [] } : undefined,
    maxFiles: maxFiles - currentUrls.length,
    disabled: uploading
  })

  const addUrl = () => {
    if (urlInput.trim() && currentUrls.length < maxFiles) {
      onUpload([...currentUrls, urlInput.trim()])
      setUrlInput('')
      toast.success('URL added successfully')
    }
  }

  const removeUrl = (index: number) => {
    const newUrls = currentUrls.filter((_, i) => i !== index)
    onUpload(newUrls)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <Button variant="outline" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Browse Files'}
            </Button>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Or paste image URL here..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addUrl()}
          disabled={currentUrls.length >= maxFiles}
        />
        <Button 
          onClick={addUrl} 
          disabled={!urlInput.trim() || currentUrls.length >= maxFiles}
          variant="outline"
        >
          Add
        </Button>
      </div>

      {/* Preview Grid */}
      {currentUrls.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {currentUrls.length} of {maxFiles} files
            </p>
            {required && currentUrls.length === 0 && (
              <p className="text-sm text-red-500">At least one file is required</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                </div>
                <button
                  onClick={() => removeUrl(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
