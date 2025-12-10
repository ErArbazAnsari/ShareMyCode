"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GistCard } from "@/components/gist-card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useUser } from "@clerk/nextjs"

// Hardcoded demo gists as fallback
const fallbackDemoGists = [
  {
    _id: "demo-js-1",
    userId: "demo",
    user_fullName: "Demo User",
    gistViews: 1250,
    gistDescription: "JavaScript Hello World and Basic Functions",
    fileNameWithExtension: "hello.js",
    gistCode: `// JavaScript Hello World
console.log("Hello, World! 🌍");

// Basic function example
function greetUser(name) {
    return \`Hello, \${name}! Welcome to JavaScript.\`;
}

// Arrow function
const addNumbers = (a, b) => a + b;

// Example usage
const userName = "Developer";
console.log(greetUser(userName));
console.log("Sum of 5 + 3 =", addNumbers(5, 3));`,
    sharedFile: [],
    visibility: "public",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "demo-python-1",
    userId: "demo",
    user_fullName: "Demo User",
    gistViews: 890,
    gistDescription: "Python Basics - Variables, Functions, and Loops",
    fileNameWithExtension: "basics.py",
    gistCode: `# Python Hello World
print("Hello, World! 🐍")

# Variables and data types
name = "Python Developer"
age = 25

# Function definition
def greet_user(user_name, user_age):
    return f"Hello {user_name}! You are {user_age} years old."

# Example usage
print(greet_user(name, age))`,
    sharedFile: [],
    visibility: "public",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    _id: "demo-react-1",
    userId: "demo",
    user_fullName: "Demo User",
    gistViews: 675,
    gistDescription: "React Component - Simple Counter with Hooks",
    fileNameWithExtension: "Counter.jsx",
    gistCode: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default Counter;`,
    sharedFile: [],
    visibility: "public",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
]

export default function HomePage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [gists, setGists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGists() {
      try {
        setLoading(true)

        if (isSignedIn && user) {
          console.log("Fetching gists for authenticated user")
          // Fetch user's gists (both public and private)
          const response = await fetch(`/api/gists/user/${user.id}`)
          if (response.ok) {
            const data = await response.json()
            console.log("Fetched user gists:", data.length, "items")
            setGists(data)
          } else {
            console.error("Failed to fetch user gists")
            setGists([])
          }
        } else {
          console.log("User not signed in, showing demo gists")
          // For non-authenticated users, always show demo gists
          // Try to fetch from API first, fallback to hardcoded
          try {
            const response = await fetch("/api/gists/demo")
            if (response.ok) {
              const data = await response.json()
              console.log("Fetched demo gists from API:", data.length, "items")
              setGists(data)
            } else {
              console.log("API failed, using fallback demo gists")
              setGists(fallbackDemoGists)
            }
          } catch (error) {
            console.log("Error fetching demo gists, using fallback:", error)
            setGists(fallbackDemoGists)
          }
        }
      } catch (error) {
        console.error("Error in fetchGists:", error)
        if (!isSignedIn) {
          setGists(fallbackDemoGists)
        } else {
          setGists([])
        }
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchGists()
    }
  }, [isSignedIn, isLoaded, user])

  function GistSkeleton() {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Share Your Code</h1>
          <p className="text-xl text-muted-foreground mb-6">Create and share code snippets with the community</p>
          <Button asChild size="lg">
            <Link href="/create">
              <Plus className="h-5 w-5 mr-2" />
              Create New Gist
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
          <GistSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Share Your Code</h1>
        <p className="text-xl text-muted-foreground mb-6">Create and share code snippets with the community</p>
        <Button asChild size="lg">
          <Link href="/create">
            <Plus className="h-5 w-5 mr-2" />
            Create New Gist
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">{isSignedIn ? "Your Gists" : "Example Gists"}</h2>
          {isSignedIn && (
            <Button asChild variant="outline">
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Gist
              </Link>
            </Button>
          )}
        </div>

        {!isSignedIn && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">👋 Welcome! These are example gists</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
              Sign up to create your own gists and share code with the community!
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <GistSkeleton />
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {isSignedIn ? `Showing ${gists.length} gists` : `Showing ${gists.length} example gists`}
            </p>
            {gists.map((gist: any) => (
              <GistCard key={gist._id} gist={gist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
