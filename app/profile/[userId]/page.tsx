"use client"

import { useState, useEffect } from "react"
import { GistCard } from "@/components/gist-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, Code, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { AlertCircle } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { userId } = useParams() as { userId: string }
  const { user: currentUser, isLoaded: authLoaded } = useUser()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [gists, setGists] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGistDelete = async (deletedGistId: string) => {
    try {
      // Update local state immediately for better UX
      setGists((prevGists) => prevGists.filter((gist) => gist._id !== deletedGistId))

      // Refetch gists data
      const gistsResponse = await fetch(`/api/gists/user/${userId}`)
      if (!gistsResponse.ok) {
        throw new Error("Failed to fetch gists")
      }
      const gistsData = await gistsResponse.json()

      // Add user image URL to each gist
      const gistsWithUserImage = gistsData.map((gist: any) => ({
        ...gist,
        userImageUrl: userInfo?.imageUrl
      }))

      setGists(gistsWithUserImage)
      router.refresh()
    } catch (error) {
      console.error("Error refreshing gists:", error)
      // If refetch fails, keep the local state update
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch gists
        const gistsResponse = await fetch(`/api/gists/user/${userId}`)
        if (!gistsResponse.ok) {
          throw new Error("Failed to fetch gists")
        }
        const gistsData = await gistsResponse.json()

        // Add user image URL to each gist
        const gistsWithUserImage = gistsData.map((gist: any) => ({
          ...gist,
          userImageUrl: userInfo?.imageUrl
        }))

        setGists(gistsWithUserImage)

        // If we have gists, use the first one's user info
        if (gistsData.length > 0) {
          setUserInfo({
            fullName: gistsData[0].user_fullName || gistsData[0].user_full_name || "Anonymous",
            imageUrl: currentUser?.imageUrl
          })
        } else if (currentUser && currentUser.id === userId) {
          // If it's the current user's profile
          setUserInfo({
            fullName: currentUser.fullName || currentUser.username || "Anonymous",
            imageUrl: currentUser.imageUrl,
          })
        }
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId, currentUser, router])

  const isOwnProfile = currentUser?.id === userId
  const fullName = userInfo?.fullName || "Anonymous"

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Error Loading Profile</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const publicGists = gists.filter((gist) => gist.visibility === "public")
  const privateGists = gists.filter((gist) => gist.visibility === "private")

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="h-20 w-20">
          {userInfo?.imageUrl ? (
            <AvatarImage src={userInfo.imageUrl} alt={fullName} />
          ) : (
            <AvatarFallback className="text-lg">
              {fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{fullName}</h1>
          <p className="text-muted-foreground">
            {gists.length} gist{gists.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {gists.length === 0 ? (
        <div className="text-center py-12">
          <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isOwnProfile ? "No gists yet" : `${fullName} hasn't created any gists yet`}
          </h3>
          <p className="text-muted-foreground mb-4">
            {isOwnProfile ? "Create your first gist to get started!" : "Check back later for new gists!"}
          </p>
          {isOwnProfile && (
            <Button asChild>
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Gist
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <Accordion type="multiple" className="w-full" defaultValue={["public", "private"]}>
          <AccordionItem value="public">
            <AccordionTrigger className="text-xl font-semibold">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>{isOwnProfile ? "Public Gists" : "Gists"} ({publicGists.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {publicGists.map((gist: any) => (
                  <GistCard
                    key={gist._id}
                    gist={gist}
                    onDelete={() => handleGistDelete(gist._id)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {isOwnProfile && (
            <AccordionItem value="private">
              <AccordionTrigger className="text-xl font-semibold">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Private Gists ({privateGists.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {privateGists.map((gist: any) => (
                    <GistCard
                      key={gist._id}
                      gist={gist}
                      onDelete={() => handleGistDelete(gist._id)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  )
}
