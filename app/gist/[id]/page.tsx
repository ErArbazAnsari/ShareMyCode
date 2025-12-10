"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Lock, Globe, Calendar, AlertCircle, Trash2, ArrowLeft, Copy, Edit2, Check, Download, FileText, Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

const FILE_EXTENSIONS = [
  "js", "ts", "jsx", "tsx", "html", "css", "scss", "json", "md", "txt", "py", "java", "c", "cpp", "php", "rb", "go", "rs", "swift", "kt"
]

export default function GistPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useUser()
  const id = params.id as string
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [gist, setGist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedGist, setEditedGist] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [filesToDelete, setFilesToDelete] = useState<string[]>([])

  useEffect(() => {
    async function fetchGist() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/gists/${id}`)

        if (response.status === 404) {
          setError("Gist not found")
          return
        }

        if (response.status === 401) {
          setError("You don't have permission to view this gist")
          return
        }

        if (!response.ok) {
          setError("Failed to load gist")
          return
        }

        const data = await response.json()
        setGist(data)
        setEditedGist(data)
      } catch (err) {
        setError("Network error - please check your connection")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchGist()
    }
  }, [id])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/gists/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete gist")
      }

      router.push("/")
    } catch (error) {
      console.error("Error deleting gist:", error)
      setError("Failed to delete gist")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Check if user already has a file
    if (editedGist.sharedFile.length > 0 || newFiles.length > 0) {
      toast.error("Please remove the existing file before uploading a new one")
      return
    }

    // Only take the first file if multiple are selected
    const fileToAdd = selectedFiles[0]
    setNewFiles([fileToAdd])
  }

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingFile = (fileUrl: string) => {
    setFilesToDelete((prev) => [...prev, fileUrl])
    setEditedGist({
      ...editedGist,
      sharedFile: editedGist.sharedFile.filter((file: any) => file.fileUrl !== fileUrl)
    })
    // Clear any existing new files when removing the old one
    setNewFiles([])
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const formData = new FormData()
      formData.append("gistDescription", editedGist.gistDescription)
      formData.append("fileNameWithExtension", editedGist.fileNameWithExtension)
      formData.append("gistCode", editedGist.gistCode)
      formData.append("visibility", editedGist.visibility)

      // Add new file if exists
      if (newFiles.length > 0) {
        formData.append("files", newFiles[0])
      }

      // Add files to delete
      formData.append("filesToDelete", JSON.stringify(filesToDelete))

      const response = await fetch(`/api/gists/${id}`, {
        method: "PATCH",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to update gist")
      }

      const updatedGist = await response.json()
      setGist(updatedGist)
      setEditedGist(updatedGist)
      setNewFiles([])
      setFilesToDelete([])
      setIsEditing(false)
      toast.success("Gist updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Error updating gist:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update gist")
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      setEditedGist({ ...editedGist, gistCode: newValue })

      // Set cursor position after the inserted tab
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      })
    }
  }

  const handleCancel = () => {
    setEditedGist(gist)
    setNewFiles([])
    setFilesToDelete([])
    setIsEditing(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gist.gistCode)
      setCopied(true)
      toast.success("Code copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy code")
    }
  }

  const handleDownloadCode = () => {
    try {
      const blob = new Blob([gist.gistCode], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = gist.fileNameWithExtension
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success("Code downloaded successfully")
    } catch (error) {
      toast.error("Failed to download code")
    }
  }

  const handleDownloadAttachment = async (file: any) => {
    try {
      // Clean the URL by removing any @ symbol at the start
      const cleanUrl = file.fileUrl.replace(/^@/, '')

      // Fetch the file with the correct headers to preserve content
      const response = await fetch(cleanUrl, {
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch file')

      // Get the blob with the correct type
      const blob = await response.blob()

      // Create a temporary link element
      const link = document.createElement('a')
      const url = window.URL.createObjectURL(blob)

      // Set up the link with the original filename and content type
      link.style.display = 'none'
      link.href = url
      link.download = file.fileName

      // Add to document, click, and remove
      document.body.appendChild(link)
      link.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      toast.success("Download started")
    } catch (error) {
      console.error('Download error:', error)
      toast.error("Failed to download file. Please try again.")

      // Fallback: Try direct download
      try {
        const cleanUrl = file.fileUrl.replace(/^@/, '')
        const link = document.createElement('a')
        link.href = cleanUrl
        link.download = file.fileName
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    }
  }

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "txt"
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const lastDotIndex = value.lastIndexOf('.')
    if (lastDotIndex === -1) {
      setEditedGist({ ...editedGist, fileNameWithExtension: value })
      return
    }

    const name = value.substring(0, lastDotIndex)
    const extension = value.substring(lastDotIndex + 1)
    if (extension && !FILE_EXTENSIONS.includes(extension.toLowerCase())) {
      toast.error("Invalid file extension")
      return
    }

    setEditedGist({ ...editedGist, fileNameWithExtension: value })
  }

  const handleExtensionChange = (extension: string) => {
    const lastDotIndex = editedGist.fileNameWithExtension.lastIndexOf('.')
    const name = lastDotIndex === -1
      ? editedGist.fileNameWithExtension
      : editedGist.fileNameWithExtension.substring(0, lastDotIndex)

    const newFileName = `${name}.${extension.toLowerCase()}`
    setEditedGist({
      ...editedGist,
      fileNameWithExtension: newFileName
    })
  }

  const getCurrentExtension = () => {
    const lastDotIndex = editedGist.fileNameWithExtension.lastIndexOf('.')
    if (lastDotIndex === -1) return ''
    return editedGist.fileNameWithExtension.substring(lastDotIndex + 1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-4">Error Loading Gist</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!gist) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Gist Not Found</h1>
        <p className="text-muted-foreground mb-6">The gist you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  const isOwner = currentUser?.id === gist.userId
  const lines = gist.gistCode.split("\n")
  const lineNumbers = Array.from({ length: lines.length }, (_, i) => i + 1)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            {currentUser && (
              <Button
                variant="ghost"
                className="mb-4 -ml-2 border"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {isEditing ? (
              <Input
                value={editedGist.gistDescription}
                onChange={(e) => setEditedGist({ ...editedGist, gistDescription: e.target.value })}
                className="text-3xl font-bold mb-2"
                placeholder="Untitled Gist"
              />
            ) : (
              <h1 className="text-3xl font-bold mb-2">{gist.gistDescription || "Untitled Gist"}</h1>
            )}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {gist.user_fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{gist.user_fullName}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(gist.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!gist._id.startsWith("demo-") && isOwner && (
              <>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={editedGist.visibility}
                      onValueChange={(value) => setEditedGist({ ...editedGist, visibility: value })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleEdit}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {!isEditing && (
              <Badge variant={gist.visibility === "public" ? "default" : "secondary"}>
                {gist.visibility === "public" ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" /> Private
                  </>
                )}
              </Badge>
            )}
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{gist.gistViews}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Gist Notice */}
      {gist._id.startsWith("demo-") && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📝 This is an example gist</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            This is a demo gist to show you how the platform works. Sign up to create your own gists!
          </p>
        </div>
      )}

      {/* Code Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedGist.fileNameWithExtension}
                    onChange={handleFileNameChange}
                    className="text-lg"
                  />
                  <Select
                    value={getCurrentExtension()}
                    onValueChange={handleExtensionChange}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILE_EXTENSIONS.map((ext) => (
                        <SelectItem key={ext} value={ext}>
                          {ext.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <CardTitle className="text-lg">{gist.fileNameWithExtension}</CardTitle>
                  <Badge variant="outline">{getFileExtension(gist.fileNameWithExtension).toUpperCase()}</Badge>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 border"
                onClick={() => {
                  const rawUrl = `/api/gists/${id}/${gist.fileNameWithExtension}`
                  window.open(rawUrl, '_blank')
                }}
                title="View Raw"
              >
                Raw
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDownloadCode}
                title="Download Code"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
                title="Copy Code"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-lg overflow-hidden">
            <div className="flex">
              <div className="flex flex-col bg-muted/30 text-muted-foreground text-sm font-mono p-4 select-none border-r">
                {lineNumbers.map((num) => (
                  <div key={num} className="leading-6 text-right min-w-[2rem]">
                    {num}
                  </div>
                ))}
              </div>

              <div className="flex-1 overflow-x-auto">
                {isEditing ? (
                  <Textarea
                    ref={textareaRef}
                    value={editedGist.gistCode}
                    onChange={(e) => setEditedGist({ ...editedGist, gistCode: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="p-4 text-sm font-mono leading-6 min-h-[300px] resize-none border-0 focus-visible:ring-0"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                ) : (
                  <pre className="p-4 text-sm font-mono leading-6 whitespace-pre-wrap">
                    <code>{gist.gistCode}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Section */}
      {gist.sharedFile && gist.sharedFile.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Existing Files */}
              {editedGist.sharedFile.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.fileSize / 1024).toFixed(1)} KB • Uploaded {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownloadAttachment(file)}
                        title="Download File"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeExistingFile(file.fileUrl)}
                        title="Remove File"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* New Files Upload Section (only in edit mode) */}
              {isEditing && (
                <div className="mt-4">
                  <Label
                    htmlFor="file-upload"
                    className={`cursor-pointer ${editedGist.sharedFile.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors ${editedGist.sharedFile.length > 0
                      ? 'bg-muted/50'
                      : 'hover:border-muted-foreground/50'
                      }`}>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {editedGist.sharedFile.length > 0
                          ? "Remove existing file to upload a new one"
                          : "Click to upload a file or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">One file only</p>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={editedGist.sharedFile.length > 0}
                  />

                  {/* New Files List */}
                  {newFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {newFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeNewFile(index)}
                            title="Remove File"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this gist?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the gist
              and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
