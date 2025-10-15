"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface ThumbnailUploadProps {
  value?: string
  onChange: (url: string) => void
  onBlur?: () => void
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
}

export function ThumbnailUpload({
  value = "",
  onChange,
  onBlur,
  disabled = false,
  required = false,
  id,
  name,
}: ThumbnailUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        return { ok: false, error }
      }

      const data = await response.json()
      return { ok: true, url: data.url }
    } catch (error) {
      return { ok: false, error: "Upload failed" }
    }
  }

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      // Check aspect ratio (warn if not square)
      const img = new Image()
      img.onload = async () => {
        const aspectRatio = img.width / img.height
        if (Math.abs(aspectRatio - 1) > 0.1) {
          toast.warning("Recommended: square image (1:1 aspect ratio)")
        }

        setIsUploading(true)
        try {
          const result = await uploadFile(file)
          if (result.ok && result.url) {
            onChange(result.url)
            toast.success("Thumbnail uploaded!")
          } else {
            toast.error(result.error || "Upload failed")
          }
        } catch (error) {
          console.error("Upload error:", error)
          toast.error("Upload failed")
        } finally {
          setIsUploading(false)
        }
      }
      img.src = URL.createObjectURL(file)
    },
    [onChange]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith("image/"))

    if (imageFile) {
      handleFileSelect(imageFile)
    } else {
      toast.error("Please drop an image file")
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find((item) => item.type.startsWith("image/"))

    if (imageItem) {
      const file = imageItem.getAsFile()
      if (file) {
        handleFileSelect(file)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return
    
    try {
      setIsUploading(true)
      const response = await fetch('/api/upload/from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() })
      })
      
      const data = await response.json()
      
      if (response.ok && data.url) {
        onChange(data.url)
        setUrlInput("")
        setShowUrlInput(false)
        toast.success("Thumbnail URL imported!")
      } else {
        toast.error(data.error || "Failed to import image from URL")
      }
    } catch (error) {
      console.error('URL import error:', error)
      toast.error("Failed to import image from URL")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    onBlur?.()
  }

  const handleChange = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      {/* Main upload area */}
      <div
        className={`w-full h-[180px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-neutral-400 hover:border-purple-500/60 hover:bg-purple-950/10 transition-all duration-300 relative ${
          isDragOver
            ? "border-purple-500 bg-purple-950/20"
            : "border-neutral-700"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={() => !value && !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {value ? (
          <>
            {/* Image preview */}
            <img
              src={value}
              alt="Thumbnail preview"
              className="w-[140px] h-[140px] rounded-md object-cover shadow-lg"
            />

            {/* Hover overlay with controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-300 rounded-xl">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleChange()
                }}
                className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                disabled={disabled || isUploading}
              >
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Empty state */}
            <Upload className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-sm">Drag & drop image or paste URL</p>
            <p className="text-xs text-neutral-500 mt-1">(512×512px recommended)</p>
          </>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <div className="text-white text-sm">Uploading...</div>
          </div>
        )}
      </div>

      {/* URL input option */}
      {!value && (
        <div className="flex gap-2">
          <input
            ref={urlInputRef}
            type="url"
            placeholder="Or paste image URL here..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUrlSubmit()
              }
            }}
            className="flex-1 bg-neutral-900 border border-neutral-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 placeholder-gray-500 transition-all duration-200"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            disabled={disabled || !urlInput.trim() || isUploading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Importing..." : "Import URL"}
          </button>
        </div>
      )}
    </div>
  )
}

export default ThumbnailUpload
