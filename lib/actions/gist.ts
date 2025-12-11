"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import clientPromise from "@/lib/mongodb"
import { uploadToCloudinary } from "@/lib/cloudinary"
import type { SharedFile } from "@/lib/models/gist"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createGist(formData: FormData) {
    try {
        console.log("Starting gist creation...")

        // Get authentication info
        const authResult = await auth()
        const userId = authResult.userId

        if (!userId) {
            throw new Error("Please sign in to create a gist")
        }

        const user = await currentUser()
        if (!user) {
            throw new Error("User session not found")
        }

        const gistDescription = formData.get("gistDescription") as string
        const fileNameWithExtension = formData.get("fileNameWithExtension") as string
        const gistCode = formData.get("gistCode") as string
        const visibility = formData.get("visibility") as "public" | "private"
        const files = formData.getAll("files") as File[]

        console.log("Form data received:", {
            gistDescription: gistDescription?.substring(0, 30),
            fileNameWithExtension,
            codeLength: gistCode?.length,
            visibility,
            filesCount: files.length,
        })

        // Validate required fields
        if (!fileNameWithExtension?.trim()) {
            throw new Error("Filename is required")
        }

        if (!gistCode?.trim()) {
            throw new Error("Code content is required")
        }

        // Get user full name
        const userFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.firstName || "Anonymous"

        console.log("User full name:", userFullName)

        // Process files if any
        const sharedFiles: SharedFile[] = []

        if (files && files.length > 0) {
            console.log("Processing files:", files.length)

            for (const file of files) {
                if (file.size > 0) {
                    // Validate file size (200MB limit)
                    const maxSize = 200 * 1024 * 1024 // 200MB
                    if (file.size > maxSize) {
                        throw new Error(`File ${file.name} is too large. Maximum size is 200MB.`)
                    }

                    console.log("Uploading file:", file.name, "Size:", (file.size / 1024 / 1024).toFixed(2), "MB")

                    try {
                        const uploadResult = await uploadToCloudinary(file)
                        console.log("File uploaded successfully:", uploadResult.publicId)

                        sharedFiles.push({
                            fileName: file.name,
                            fileUrl: uploadResult.url,
                            fileSize: file.size,
                            uploadedAt: new Date(),
                        })
                    } catch (uploadError) {
                        console.error("File upload error:", uploadError)
                        throw new Error(`Failed to upload file ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
                    }
                }
            }
        }

        // Connect to MongoDB
        console.log("Connecting to MongoDB...")
        const client = await clientPromise
        const db = client.db("gist_clone")
        const collection = db.collection("user_gist")

        // Create gist data matching the database schema
        const gistData = {
            userId,
            user_full_name: userFullName,
            gistViews: 0,
            gistDescription: gistDescription || "",
            fileNameWithExtension,
            gistCode,
            sharedFile: sharedFiles,
            visibility: visibility || "public",
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        console.log("Inserting gist data...")
        const result = await collection.insertOne(gistData)
        const gistId = result.insertedId.toString()

        console.log("Gist created with ID:", gistId)

        // Revalidate and return gistId to the client so it can navigate
        revalidatePath("/")
        return gistId

    } catch (error) {
        console.error("Gist creation error:", error)

        // Re-throw the error so it can be handled by the client
        if (error instanceof Error) {
            throw error
        }

        throw new Error("An unexpected error occurred while creating the gist")
    }
}