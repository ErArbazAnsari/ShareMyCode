import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId: currentUserId } = await auth()
    const targetUserId = params?.userId

    if (!currentUserId) {
      // If not authenticated, only show public gists
      const client = await clientPromise
      const db = client.db("gist_clone")
      const collection = db.collection("user_gist")
      const publicGists = await collection
        .find({ userId: targetUserId, visibility: "public" })
        .sort({ createdAt: -1 })
        .toArray()
      
      return NextResponse.json(publicGists.map(gist => ({
        ...gist,
        _id: gist._id.toString()
      })))
    }

    const client = await clientPromise
    const db = client.db("gist_clone")
    const collection = db.collection("user_gist")

    // If viewing own profile, show all gists
    // If viewing someone else's profile, only show public gists
    const query = currentUserId === targetUserId
      ? { userId: targetUserId }
      : { userId: targetUserId, visibility: "public" }

    const gists = await collection.find(query).sort({ createdAt: -1 }).toArray()

    const serializedGists = gists.map((gist) => ({
      ...gist,
      _id: gist._id.toString(),
    }))

    return NextResponse.json(serializedGists)
  } catch (error) {
    console.error("Error fetching user gists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
