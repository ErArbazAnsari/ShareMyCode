import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Lock, Globe, Calendar, Trash2 } from "lucide-react"
import type { Gist } from "@/lib/models/gist"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
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

interface GistCardProps {
  gist: Gist
  onDelete?: () => void
}

export function GistCard({ gist, onDelete }: GistCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "TXT"
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const initials = gist.user_fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/gists/${gist._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete gist")
      }

      if (onDelete) {
        await onDelete()
      }

      router.refresh()
    } catch (error) {
      console.error("Error deleting gist:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Card
        className="hover:shadow-md transition-shadow relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => router.push(`/gist/${gist._id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                {gist.userImageUrl ? (
                  <AvatarImage src={gist.userImageUrl} alt={gist.user_fullName} />
                ) : (
                  <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {gist.gistDescription || "Untitled Gist"}
                </CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <span>{gist.user_fullName}</span>
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(gist.createdAt)}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <div className="w-8 h-8">
                {!gist._id.startsWith("demo-") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{gist.gistViews}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{getFileExtension(gist.fileNameWithExtension)}</Badge>
                <span className="text-sm text-muted-foreground">{gist.fileNameWithExtension}</span>
              </div>
            </div>

            <div className="bg-muted rounded-md p-3">
              <pre className="text-sm overflow-hidden whitespace-pre-wrap">
                <code className="line-clamp-3">
                  {gist.gistCode.slice(0, 200)}
                  {gist.gistCode.length > 200 && "..."}
                </code>
              </pre>
            </div>

            {gist.sharedFile && gist.sharedFile.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {gist.sharedFile.length} attached file{gist.sharedFile.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
    </>
  )
}
