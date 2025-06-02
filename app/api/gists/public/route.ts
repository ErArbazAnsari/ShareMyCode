import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("gist_clone")
    const collection = db.collection("user_gist")

    const gists = await collection.find({ visibility: "public" }).sort({ createdAt: -1 }).limit(20).toArray()

    // Convert ObjectId to string for JSON serialization
    const serializedGists = gists.map((gist) => ({
      ...gist,
      _id: gist._id.toString(),
    }))

    return NextResponse.json(serializedGists)
  } catch (error) {
    console.error("Error fetching public gists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
