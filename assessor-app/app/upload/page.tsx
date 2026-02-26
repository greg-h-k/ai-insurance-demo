"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, AlertCircle, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"]

type UploadState = "idle" | "uploading" | "error"

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 10MB."
    }
    return null
  }

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setFile(file)
    setUploadState("idle")

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setUploadState("idle")
    setError(null)
  }

  const uploadFile = async () => {
    if (!file) return

    setUploadState("uploading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      router.push(`/uploads/${data.uploadId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploadState("error")
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            ← Back to Home
          </Link>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Upload Damage Photo
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Upload a clear photo of the vehicle damage for AI assessment
            </p>
          </div>

          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Select Image</CardTitle>
              <CardDescription>
                Supported formats: JPEG, PNG, GIF, WebP. Maximum size: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Drop zone */}
              {!file && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                    dragActive
                      ? "border-zinc-900 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-800"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  <ImageIcon className="mb-4 h-12 w-12 text-zinc-400" />
                  <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-zinc-500">
                    JPEG, PNG, GIF, WebP up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif"
                    onChange={handleInputChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </div>
              )}

              {/* Preview */}
              {file && preview && (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-auto w-full object-contain"
                      style={{ maxHeight: "400px" }}
                    />
                    {uploadState !== "uploading" && (
                      <button
                        onClick={clearFile}
                        className="absolute right-2 top-2 rounded-full bg-zinc-900/80 p-1.5 text-white transition-colors hover:bg-zinc-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex items-center justify-between rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-8 w-8 text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {file.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex gap-3">
                {file && uploadState !== "uploading" && (
                  <Button onClick={uploadFile} className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                )}
                {uploadState === "uploading" && (
                  <Button disabled className="flex-1">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analysing damage...
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-6 border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg">Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  Take photos in good lighting conditions
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  Capture the damage from multiple angles
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  Include close-up shots of specific damage areas
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  Ensure the vehicle and damage are clearly visible
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
