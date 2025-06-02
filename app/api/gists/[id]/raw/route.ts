import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("gist_clone")
    const collection = db.collection("user_gist")

    // Get the gist
    const gist = await collection.findOne({ _id: new ObjectId(params.id) })
    if (!gist) {
      return NextResponse.json({ error: "Gist not found" }, { status: 404 })
    }

    // Return the raw code with appropriate headers
    return new NextResponse(gist.gistCode, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `inline; filename="${gist.fileNameWithExtension}"`,
      },
    })
  } catch (error) {
    console.error("Error fetching raw gist:", error)
    return NextResponse.json(
      { error: "Failed to fetch gist" },
      { status: 500 }
    )
  }
} 