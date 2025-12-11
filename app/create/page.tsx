"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CodeEditor } from "@/components/code-editor"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { MAX_FILE_SIZE, MESSAGES, FORM_MESSAGES } from "@/lib/constants"
import type { GistVisibility } from "@/types"
import { createGist } from "@/lib/actions/gist"

export default function CreateGistPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    gistDescription: "",
    fileNameWithExtension: "",
    gistCode: "",
    visibility: "public" as GistVisibility,
  })

  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; publicId?: string; name: string; size: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  // Auto-upload small files directly to Cloudinary for progress UI.
  // For larger files we fallback to server-side upload to avoid CORS/413 issues.
  const AUTO_UPLOAD_LIMIT = 10 * 1024 * 1024 // 10 MB

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (files.length > 0) {
      toast({
        title: "File limit reached",
        description: MESSAGES.FILE_LIMIT_REACHED,
        variant: "destructive",
      })
      return
    }

    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File size too large",
        description: `${MESSAGES.FILE_SIZE_TOO_LARGE}: ${oversizedFiles.map(f => f.name).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    const fileToAdd = selectedFiles[0]
    setFiles([fileToAdd])
    // Always start upload flow on selection. uploadFileToCloudinary will
    // do direct uploads for small files and chunked uploads for large files.
    void uploadFileToCloudinary(fileToAdd)
  }

  async function uploadFileToCloudinary(file: File) {
    // Use direct signed Cloudinary upload for small files, chunked server upload for larger files.
    try {
      setUploadProgress(0)

      if (file.size <= AUTO_UPLOAD_LIMIT) {
        // Direct signed upload (small files)
        const sigRes = await fetch('/api/cloudinary/signature')
        if (!sigRes.ok) throw new Error('Failed to get upload signature')
        const sigJson = await sigRes.json()
        const { apiKey, cloudName, timestamp, signature } = sigJson

        const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
        const form = new FormData()
        form.append('file', file)
        form.append('api_key', apiKey)
        form.append('timestamp', String(timestamp))
        form.append('signature', signature)
        form.append('folder', 'gist-files')

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', url)
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100)
              setUploadProgress(percent)
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText)
                setUploadedFile({ url: res.secure_url, publicId: res.public_id, name: file.name, size: file.size })
                setUploadProgress(100)
                resolve()
              } catch (err) {
                reject(err)
              }
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
          xhr.onerror = () => reject(new Error('Network error during upload'))
          xhr.send(form)
        })
      } else {
        // Chunked upload to our server for large files
        const chunkSize = 5 * 1024 * 1024 // 5MB
        const totalParts = Math.ceil(file.size / chunkSize)
        const uploadId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : String(Date.now())

        for (let i = 0; i < totalParts; i++) {
          const start = i * chunkSize
          const end = Math.min(start + chunkSize, file.size)
          const chunk = file.slice(start, end)

          const res = await fetch(`/api/uploads/${uploadId}?partIndex=${i}&totalParts=${totalParts}&filename=${encodeURIComponent(file.name)}`, {
            method: 'POST',
            body: chunk,
          })

          if (!res.ok) {
            const txt = await res.text().catch(() => null)
            throw new Error(`Chunk upload failed (status ${res.status}) ${txt ? '- ' + txt : ''}`)
          }

          const json = await res.json().catch(() => null)
          const percent = Math.round(((i + 1) / totalParts) * 100)
          setUploadProgress(percent)

          // If server returned final url (assembled), take it
          if (json?.url) {
            setUploadedFile({ url: json.url, publicId: json.publicId || json.public_id, name: file.name, size: file.size })
            setUploadProgress(100)
            break
          }
        }
      }
    } catch (err) {
      console.error('Client upload error:', err)
      setUploadProgress(null)
      setUploadedFile(null)
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast({ title: 'Upload failed', description: message, variant: 'destructive' })
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: MESSAGES.AUTH_REQUIRED,
        variant: "destructive",
      })
      return
    }

    if (!formData.fileNameWithExtension || !formData.gistCode) {
      toast({
        title: "Error",
        description: FORM_MESSAGES.BOTH_REQUIRED,
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("gistDescription", formData.gistDescription)
      submitData.append("fileNameWithExtension", formData.fileNameWithExtension)
      submitData.append("gistCode", formData.gistCode)
      submitData.append("visibility", formData.visibility)

      if (showAttachments) {
        if (uploadedFile) {
          submitData.append('uploadedFileUrl', uploadedFile.url)
          submitData.append('uploadedFileName', uploadedFile.name)
          submitData.append('uploadedFileSize', String(uploadedFile.size))
          submitData.append('uploadedFilePublicId', uploadedFile.publicId || '')
        } else if (files.length > 0) {
          // Fallback: send the raw file to the server which will upload to Cloudinary
          submitData.append("files", files[0])
        }
      }

      console.log("Submitting form with fields:", {
        description: formData.gistDescription?.substring(0, 30),
        filename: formData.fileNameWithExtension,
        codeLength: formData.gistCode?.length,
        visibility: formData.visibility,
        hasFiles: files.length > 0,
      })

      // POST to the API route which accepts large multipart uploads
      const response = await fetch("/api/gists", {
        method: "POST",
        body: submitData,
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.details || result?.error || MESSAGES.ERROR_OCCURRED)
      }

      toast({
        title: "Success",
        description: MESSAGES.GIST_CREATED,
      })

      if (result?.gistId) {
        router.push(`/gist/${result.gistId}`)
      }

    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : MESSAGES.ERROR_OCCURRED,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to create a gist.</p>
        <SignInButton mode="modal">
          <Button size="lg">Sign In</Button>
        </SignInButton>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a new gist</h1>
        <p className="text-muted-foreground">
          Share your code snippets with the community or keep them private for yourself.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gist Details</CardTitle>
            <CardDescription>Provide a description and filename for your code snippet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Gist description...</Label>
              <Input
                id="description"
                placeholder="What does this gist do?"
                value={formData.gistDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, gistDescription: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filename">Filename including extension...</Label>
                <Input
                  id="filename"
                  placeholder="example.js"
                  value={formData.fileNameWithExtension}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fileNameWithExtension: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value: "public" | "private") =>
                    setFormData((prev) => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code</CardTitle>
            <CardDescription>Write or paste your code here.</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeEditor
              value={formData.gistCode}
              onChange={(value) => setFormData((prev) => ({ ...prev, gistCode: value }))}
              placeholder="// Start typing your code here..."
            />
          </CardContent>
        </Card>

        {/* Attachments Section with Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Additional Files</CardTitle>
                <CardDescription>
                  Upload one additional file to share alongside your code. Maximum file size: 200 MB
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="attachments-toggle"
                  checked={showAttachments}
                  onCheckedChange={setShowAttachments}
                />
                <Label htmlFor="attachments-toggle" className="text-sm">
                  {showAttachments ? "Hide" : "Show"} Attachments
                </Label>
              </div>
            </div>
          </CardHeader>
          {showAttachments && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload a file or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">Maximum file size: 200 MB (One file only)</p>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Files List */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                              {file.size > MAX_FILE_SIZE && (
                                <span className="text-destructive ml-2">(Too large)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFile(index)}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Upload progress / result */}
                    {uploadProgress !== null && (
                      <div className="mt-2 text-sm text-muted-foreground">Uploading: {uploadProgress}%</div>
                    )}

                    {uploadedFile && (
                      <div className="mt-2 text-sm text-success">Uploaded: {uploadedFile.name}</div>
                    )}

                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Gist"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
