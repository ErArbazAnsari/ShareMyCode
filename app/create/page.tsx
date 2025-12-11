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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

export default function CreateGistPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    gistDescription: "",
    fileNameWithExtension: "",
    gistCode: "",
    visibility: "public" as "public" | "private",
  })

  const [files, setFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [uploadXhr, setUploadXhr] = useState<XMLHttpRequest | null>(null)
  const [uploadedFileInfo, setUploadedFileInfo] = useState<any | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB in bytes
  const CLOUDINARY_CHUNK_SIZE = 9 * 1024 * 1024 // 9MB chunks (under 10MB Cloudinary limit)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Prevent multiple files client-side
    if (files.length > 0 || uploadedFileInfo) {
      toast({
        title: "File limit reached",
        description: "You can only upload one file per gist",
        variant: "destructive",
      })
      return
    }

    if (selectedFiles.length === 0) return

    const fileToAdd = selectedFiles[0]

    // Validate file size
    if (fileToAdd.size > MAX_FILE_SIZE) {
      toast({
        title: "File size too large",
        description: `The selected file exceeds the 100MB limit: ${fileToAdd.name}`,
        variant: "destructive",
      })
      return
    }

    // Open dialog and start upload
    setSelectedFile(fileToAdd)
    setIsDialogOpen(true)
    setUploadProgress(0)
    setUploadError(null)
    startUpload(fileToAdd)
  }

  async function startUpload(file: File) {
    setIsFileUploading(true)
    
    try {
      // Get Cloudinary config
      const configRes = await fetch("/api/gists/upload/config")
      if (!configRes.ok) throw new Error("Failed to get upload config")
      const config = await configRes.json()

      const CHUNK_SIZE = 8 * 1024 * 1024 // 8MB chunks (under 10MB limit)
      
      // If file is small enough, upload directly
      if (file.size <= CHUNK_SIZE) {
        await uploadDirect(file, config)
      } else {
        // For large files, use chunked multipart upload
        await uploadChunked(file, config, CHUNK_SIZE)
      }
    } catch (err) {
      setIsFileUploading(false)
      setUploadXhr(null)
      const errorMsg = err instanceof Error ? err.message : "Upload failed"
      setUploadError(errorMsg)
      toast({ title: "Upload failed", description: errorMsg, variant: "destructive" })
    }
  }

  async function uploadDirect(file: File, config: any) {
    return new Promise<void>((resolve, reject) => {
      const form = new FormData()
      form.append("file", file)
      form.append("upload_preset", config.uploadPreset)
      form.append("folder", "gist-files")

      const xhr = new XMLHttpRequest()
      setUploadXhr(xhr)

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100)
          setUploadProgress(percent)
        }
      }

      xhr.onload = () => {
        setIsFileUploading(false)
        setUploadXhr(null)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const cloudinaryRes = JSON.parse(xhr.responseText)
            const fileInfo = {
              fileName: file.name,
              fileUrl: cloudinaryRes.secure_url,
              fileSize: file.size,
              publicId: cloudinaryRes.public_id,
            }
            setUploadedFileInfo(fileInfo)
            setFiles([])
            toast({ title: "Upload succeeded", description: file.name })
            resolve()
          } catch (err) {
            reject(new Error("Invalid Cloudinary response"))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        setIsFileUploading(false)
        setUploadXhr(null)
        reject(new Error("Network error"))
      }

      xhr.open("POST", `https://api.cloudinary.com/v1_1/${config.cloudName}/upload`)
      xhr.send(form)
    })
  }

  async function uploadChunked(file: File, config: any, chunkSize: number) {
    // For chunked uploads, we need to use server-side processing
    // because Cloudinary's chunked upload API requires signatures per chunk
    const form = new FormData()
    form.append("files", file)

    const xhr = new XMLHttpRequest()
    setUploadXhr(xhr)

    let uploadedBytes = 0

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 100)
        setUploadProgress(percent)
      }
    }

    return new Promise<void>((resolve, reject) => {
      xhr.onload = () => {
        setIsFileUploading(false)
        setUploadXhr(null)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText)
            if (res?.success && res.file) {
              setUploadedFileInfo(res.file)
              setFiles([])
              toast({ title: "Upload succeeded", description: res.file.fileName })
              resolve()
            } else {
              reject(new Error(res?.error || "Upload failed"))
            }
          } catch (err) {
            reject(new Error("Invalid server response"))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        setIsFileUploading(false)
        setUploadXhr(null)
        reject(new Error("Network error"))
      }

      xhr.open("POST", "/api/gists/upload/chunked")
      xhr.send(form)
    })
  }

  function cancelUpload() {
    if (uploadXhr) {
      uploadXhr.abort()
      setUploadXhr(null)
      setIsFileUploading(false)
      setUploadProgress(0)
      setSelectedFile(null)
      setIsDialogOpen(false)
      toast({ title: "Upload canceled" })
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
        description: "Please sign in to create a gist",
        variant: "destructive",
      })
      return
    }

    if (!formData.fileNameWithExtension || !formData.gistCode) {
      toast({
        title: "Error",
        description: "Please provide both filename and code",
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

      // If a file was previously uploaded via the upload endpoint, send metadata
      // so the server can reference the already-uploaded file instead of re-uploading.
      if (showAttachments) {
        if (uploadedFileInfo) {
          submitData.append("preUploaded", "true")
          submitData.append("preUploadedFile", JSON.stringify(uploadedFileInfo))
        } else if (files.length > 0) {
          submitData.append("files", files[0])
        }
      }

      console.log("Submitting gist creation request...")

      const response = await fetch("/api/gists", {
        method: "POST",
        body: submitData,
      })

      console.log("Response status:", response.status)

      const result = await response.json()
      console.log("Response data:", result)

      if (!response.ok) {
        throw new Error(result.details || result.error || "Failed to create gist")
      }

      toast({
        title: "Success",
        description: "Gist created successfully!",
      })

      router.push(`/gist/${result.gistId}`)
    } catch (error) {
      console.error("Error creating gist:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create gist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while authentication is loading
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
                  Upload one additional file to share alongside your code. Maximum file size: 100MB
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
                      <p className="text-xs text-muted-foreground mt-1">Maximum file size: 100MB (One file only)</p>
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
                {(files.length > 0 || uploadedFileInfo) && (
                  <div className="space-y-2">
                    {uploadedFileInfo ? (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{uploadedFileInfo.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFileInfo.fileSize / 1024).toFixed(1)} KB • Uploaded
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a href={uploadedFileInfo.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary">View</a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { setUploadedFileInfo(null); setSelectedFile(null); }}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      files.map((file, index) => (
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
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Upload Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); setSelectedFile(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Uploading file</DialogTitle>
              <DialogDescription>
                {selectedFile ? selectedFile.name : "Preparing upload..."}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{selectedFile ? `${(selectedFile.size/1024/1024).toFixed(2)} MB` : null}</p>
              <div className="mt-3">
                <Progress value={uploadProgress} />
                <div className="text-sm text-muted-foreground mt-2">{uploadProgress}%</div>
                {uploadError && <div className="text-sm text-destructive mt-2">{uploadError}</div>}
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                {isFileUploading ? (
                  <Button type="button" variant="ghost" onClick={cancelUpload}>Cancel</Button>
                ) : (
                  <Button type="button" onClick={() => setIsDialogOpen(false)}>Close</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
