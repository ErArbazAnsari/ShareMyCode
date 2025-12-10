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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)

  const MAX_FILE_SIZE = 2 * 1024 // 2KB in bytes

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Check if user already has a file
    if (files.length > 0) {
      toast({
        title: "File limit reached",
        description: "You can only upload one file per gist",
        variant: "destructive",
      })
      return
    }

    // Check file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File size too large",
        description: `The following files exceed 2KB limit: ${oversizedFiles.map(f => f.name).join(", ")}`,
        variant: "destructive",
      })
      return
    }

    // Only take the first file if multiple are selected
    const fileToAdd = selectedFiles[0]
    setFiles([fileToAdd])
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

      // Only append file if one exists and showAttachments is true
      if (showAttachments && files.length > 0) {
        submitData.append("files", files[0])
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
                  Upload one additional file to share alongside your code. Maximum file size: 2KB
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
                      <p className="text-xs text-muted-foreground mt-1">Maximum file size: 2KB (One file only)</p>
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
