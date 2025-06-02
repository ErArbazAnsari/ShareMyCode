import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"
import cloudinary from "@/lib/cloudinary"

// Demo gists data
const demoGists = [
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
console.log("Sum of 5 + 3 =", addNumbers(5, 3));

// Working with arrays
const fruits = ["apple", "banana", "orange"];
fruits.forEach(fruit => console.log(\`I love \${fruit}s!\`));`,
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
is_programmer = True
favorite_languages = ["Python", "JavaScript", "Go"]

# Function definition
def greet_user(user_name, user_age):
    return f"Hello {user_name}! You are {user_age} years old."

# Class example
class Calculator:
    def add(self, a, b):
        return a + b
    
    def multiply(self, a, b):
        return a * b

# Example usage
print(greet_user(name, age))

calc = Calculator()
print(f"5 + 3 = {calc.add(5, 3)}")
print(f"4 * 7 = {calc.multiply(4, 7)}")

# Loop through list
for language in favorite_languages:
    print(f"I enjoy coding in {language}")`,
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

// Simple Counter Component using React Hooks
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const increment = () => setCount(count + step);
  const decrement = () => setCount(count - step);
  const reset = () => setCount(0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      
      <div className="controls">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="step-control">
        <label>
          Step: 
          <input 
            type="number" 
            value={step} 
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <style jsx>{\`
        .counter { text-align: center; padding: 20px; }
        .controls button { margin: 0 5px; padding: 10px 15px; }
        .step-control { margin-top: 15px; }
      \`}</style>
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gistId = params?.id
    console.log("Fetching gist with ID:", gistId)

    // Check if it's a demo gist first
    const demoGist = demoGists.find((gist) => gist._id === gistId)
    if (demoGist) {
      console.log("Found demo gist:", demoGist._id)
      // Increment view count for demo gist (just for display, not persisted)
      const updatedDemoGist = {
        ...demoGist,
        gistViews: demoGist.gistViews + 1,
      }
      return NextResponse.json(updatedDemoGist)
    }

    // If not a demo gist, try to fetch from MongoDB
    let isValidObjectId = true
    try {
      new ObjectId(gistId)
    } catch (error) {
      isValidObjectId = false
    }

    if (!isValidObjectId) {
      console.log("Invalid ObjectId format:", gistId)
      return NextResponse.json({ error: "Gist not found" }, { status: 404 })
    }

    // Connect to MongoDB with better error handling
    let client
    try {
      client = await clientPromise
      console.log("Connected to MongoDB successfully")
    } catch (dbError) {
      console.error("MongoDB connection error:", dbError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const db = client.db("gist_clone")
    const collection = db.collection("user_gist")

    const gist = await collection.findOne({ _id: new ObjectId(gistId) })
    console.log("Database query result:", gist ? "Found gist" : "No gist found")

    if (!gist) {
      console.log("Gist not found in database:", gistId)
      return NextResponse.json({ error: "Gist not found" }, { status: 404 })
    }

    // Check if gist is private and user is not the owner
    try {
      const { userId } = await auth()
      console.log("Current user ID:", userId)
      console.log("Gist owner ID:", gist.userId)
      console.log("Gist visibility:", gist.visibility)

      if (gist.visibility === "private" && gist.userId !== userId) {
        console.log("Unauthorized access to private gist")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch (authError) {
      console.error("Auth error:", authError)
      // For public gists, continue even if auth fails
      if (gist.visibility === "private") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Increment view count
    try {
      await collection.updateOne({ _id: new ObjectId(gistId) }, { $inc: { gistViews: 1 } })
      console.log("View count incremented")
    } catch (updateError) {
      console.error("Error updating view count:", updateError)
      // Continue even if view count update fails
    }

    const serializedGist = {
      ...gist,
      _id: gist._id.toString(),
    }

    console.log("Successfully fetched gist:", serializedGist._id)
    return NextResponse.json(serializedGist)
  } catch (error) {
    console.error("Error fetching gist:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gistId = params?.id

    // Don't allow deletion of demo gists
    const demoGist = demoGists.find((gist) => gist._id === gistId)
    if (demoGist) {
      return NextResponse.json({ error: "Cannot delete demo gists" }, { status: 403 })
    }

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("gist_clone")
    const collection = db.collection("user_gist")

    const gist = await collection.findOne({ _id: new ObjectId(gistId) })

    if (!gist) {
      return NextResponse.json({ error: "Gist not found" }, { status: 404 })
    }

    if (gist.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete files from Cloudinary
    if (gist.sharedFile && gist.sharedFile.length > 0) {
      for (const file of gist.sharedFile) {
        try {
          const publicId = file.fileUrl.split('/').slice(-1)[0].split('.')[0]
          await cloudinary.uploader.destroy(publicId)
        } catch (error) {
          console.error('Error deleting file from Cloudinary:', error)
        }
      }
    }

    await collection.deleteOne({ _id: new ObjectId(gistId) })

    return NextResponse.json({ message: "Gist deleted successfully" })
  } catch (error) {
    console.error("Error deleting gist:", error)
    return NextResponse.json(
      { error: "Failed to delete gist" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const gistDescription = formData.get("gistDescription") as string
    const fileNameWithExtension = formData.get("fileNameWithExtension") as string
    const gistCode = formData.get("gistCode") as string
    const visibility = formData.get("visibility") as "public" | "private"
    const filesToDelete = JSON.parse(formData.get("filesToDelete") as string || "[]") as string[]
    const files = formData.getAll("files") as File[]

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("gist_clone")
    const collection = db.collection("user_gist")

    // Get existing gist
    const existingGist = await collection.findOne({ _id: new ObjectId(params.id) })
    if (!existingGist) {
      return NextResponse.json({ error: "Gist not found" }, { status: 404 })
    }

    // Check if user is the owner
    if (existingGist.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle file deletions
    if (filesToDelete.length > 0) {
      for (const fileUrl of filesToDelete) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = fileUrl.split('/').slice(-1)[0].split('.')[0]
          await cloudinary.uploader.destroy(publicId)
        } catch (error) {
          console.error('Error deleting file from Cloudinary:', error)
        }
      }
    }

    // Handle new file uploads
    const newFiles = []
    for (const file of files) {
      if (file.size > 0) {
        try {
          const uploadResult = await uploadToCloudinary(file)
          newFiles.push({
            fileName: file.name,
            fileUrl: uploadResult.url,
            fileSize: file.size,
            uploadedAt: new Date(),
          })
        } catch (uploadError) {
          console.error("File upload error:", uploadError)
        }
      }
    }

    // Update gist
    const updatedGist = {
      ...existingGist,
      gistDescription,
      fileNameWithExtension,
      gistCode,
      visibility,
      sharedFile: [
        ...existingGist.sharedFile.filter((file: any) => !filesToDelete.includes(file.fileUrl)),
        ...newFiles
      ],
      updatedAt: new Date(),
    }

    await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updatedGist }
    )

    return NextResponse.json(updatedGist)
  } catch (error) {
    console.error("Error updating gist:", error)
    return NextResponse.json(
      { error: "Failed to update gist" },
      { status: 500 }
    )
  }
}
