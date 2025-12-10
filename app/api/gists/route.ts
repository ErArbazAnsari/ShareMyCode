import { type NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { SharedFile } from "@/lib/models/gist";

export async function POST(request: NextRequest) {
    try {
        console.log("Starting gist creation...");

        // Get authentication info with better error handling
        let userId: string | null = null;
        let user: any = null;

        try {
            const authResult = await auth();
            userId = authResult.userId;
            console.log("Auth result:", { userId });

            if (!userId) {
                console.log("No userId found in auth");
                return NextResponse.json(
                    {
                        error: "Unauthorized",
                        details: "Please sign in to create a gist",
                    },
                    { status: 401 }
                );
            }

            user = await currentUser();
            console.log("Current user:", {
                id: user?.id,
                firstName: user?.firstName,
            });

            if (!user) {
                console.log("No user found");
                return NextResponse.json(
                    {
                        error: "Unauthorized",
                        details: "User session not found",
                    },
                    { status: 401 }
                );
            }
        } catch (authError) {
            console.error("Authentication error:", authError);
            return NextResponse.json(
                {
                    error: "Authentication failed",
                    details: "Please sign in and try again",
                },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const gistDescription = formData.get("gistDescription") as string;
        const fileNameWithExtension = formData.get(
            "fileNameWithExtension"
        ) as string;
        const gistCode = formData.get("gistCode") as string;
        const visibility = formData.get("visibility") as "public" | "private";

        console.log("Form data received:", {
            gistDescription: gistDescription?.substring(0, 30),
            fileNameWithExtension,
            codeLength: gistCode?.length,
            visibility,
        });

        if (!fileNameWithExtension || !gistCode) {
            console.log("Missing required fields");
            return NextResponse.json(
                {
                    error: "Missing required fields",
                    details: "Filename and code are required",
                },
                { status: 400 }
            );
        }

        // Get user info directly from Clerk currentUser
        const user_fullName =
            user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`.trim()
                : user.username ||
                  user.emailAddresses?.[0]?.emailAddress ||
                  "Anonymous";

        console.log("User full name:", user_fullName);

        // Handle file uploads
        const files = formData.getAll("files") as File[];
        const sharedFile: SharedFile[] = [];

        console.log("Processing files:", files.length);

        // Validate file size and count
        if (files.length > 1) {
            return NextResponse.json(
                {
                    error: "Too many files",
                    details: "Only one file can be uploaded per gist",
                },
                { status: 400 }
            );
        }

        for (const file of files) {
            if (file.size > 0) {
                // Check file sized
                if (file.size > 200 * 1024) {
                    return NextResponse.json(
                        {
                            error: "File too large",
                            details: "File size must be less than 200 MB",
                        },
                        { status: 400 }
                    );
                }

                try {
                    console.log("Uploading file:", file.name, file.size);
                    const uploadResult = await uploadToCloudinary(file);
                    sharedFile.push({
                        fileName: file.name,
                        fileUrl: uploadResult.url,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                    console.log("File uploaded successfully:", file.name);
                } catch (uploadError) {
                    console.error("File upload error:", uploadError);
                    return NextResponse.json(
                        {
                            error: "File upload failed",
                            details:
                                uploadError instanceof Error
                                    ? uploadError.message
                                    : "Failed to upload file",
                        },
                        { status: 500 }
                    );
                }
            }
        }

        // Connect to MongoDB
        console.log("Connecting to MongoDB...");
        const client = await clientPromise;
        const db = client.db("gist_clone");
        const collection = db.collection("user_gist");

        const gistData = {
            userId,
            user_fullName,
            gistViews: 0,
            gistDescription: gistDescription || "",
            fileNameWithExtension,
            gistCode,
            sharedFile,
            visibility: visibility || "public",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        console.log("Inserting gist data...");
        const result = await collection.insertOne(gistData);
        console.log("Gist created with ID:", result.insertedId);

        return NextResponse.json({
            success: true,
            gistId: result.insertedId.toString(),
        });
    } catch (error) {
        console.error("Detailed error creating gist:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            },
            { status: 500 }
        );
    }
}
