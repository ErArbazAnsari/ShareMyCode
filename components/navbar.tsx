"use client"

import Link from "next/link"
import { useUser, UserButton, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Code, Plus } from "lucide-react"
import { useEffect, useState } from "react"

export function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isLoaded) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Code className="h-6 w-6" />
                <span className="font-bold text-xl">Gist Clone</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Code className="h-6 w-6" />
              <span className="font-bold text-xl">ShareMyCode</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isSignedIn ? (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    New Gist
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="border">
                  <Link href={`/profile/${user.id}`}>My Gists</Link>
                </Button>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">Sign Up</Button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
