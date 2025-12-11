import { type NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ensureIndexes } from "@/lib/db-setup";
import type { SharedFile } from "@/lib/models/gist";

// Configure max execution time for file uploads
export const maxDuration = 300;

// Use Node.js runtime for better file handling
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        console.log("Starting gist creation...");
        console.log("Request headers:", {
            contentType: request.headers.get('content-type'),
            contentLength: request.headers.get('content-length'),
        });

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

        // Reject raw multipart bodies that exceed Next.js body size limit.
        // Next.js only exposes first 10MB of request body unless configured.
        // If a client accidentally POSTs a large multipart file directly, return a clear error
        // so the client can use the chunked uploader instead.
        const contentLengthHeader = request.headers.get('content-length') || '';
        const contentTypeHeader = request.headers.get('content-type') || '';
        const contentLengthNum = Number(contentLengthHeader);
        const NEXT_BODY_LIMIT_BYTES = 10 * 1024 * 1024; // 10MB

        if (contentTypeHeader.startsWith('multipart/form-data') && contentLengthNum > NEXT_BODY_LIMIT_BYTES) {
            console.warn('Rejecting large multipart request; request size:', contentLengthNum);
            return NextResponse.json(
                {
                    error: 'Request body too large',
                    details: 'File uploads larger than 10MB must use the chunked uploader. Please upload the file via /api/uploads and submit the gist with uploaded file metadata.',
                },
                { status: 413 }
            );
        }

        // Parse request body (support both FormData and JSON)
        let formData: FormData | null = null;
        let dataObj: any = {}

        try {
            formData = await request.formData();
            // Convert FormData to a plain object while preserving File entries in `dataObj.files`.
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    dataObj.files = dataObj.files || [];
                    dataObj.files.push(value);
                } else if (Object.prototype.hasOwnProperty.call(dataObj, key)) {
                    // If key already exists, convert to array
                    if (!Array.isArray(dataObj[key])) dataObj[key] = [dataObj[key]];
                    dataObj[key].push(value);
                } else {
                    dataObj[key] = value;
                }
            }
        } catch (parseError) {
            // Not FormData — try JSON
            try {
                dataObj = await request.json();
            } catch (jsonError) {
                console.error("Failed to parse request body as FormData or JSON:", parseError, jsonError);
                return NextResponse.json(
                    {
                        error: "Invalid request format",
                        details: "Request body must be FormData or JSON",
                    },
                    { status: 400 }
                );
            }
        }

        const gistDescription = dataObj.gistDescription as string;
        const fileNameWithExtension = dataObj.fileNameWithExtension as string;
        const gistCode = dataObj.gistCode as string;
        const visibility = dataObj.visibility as "public" | "private";

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

        // Handle file uploads. We support two flows:
        // 1) Client uploaded directly to Cloudinary and sent `uploadedFileUrl` metadata.
        // 2) Client sent raw file(s) and server will upload (fallback).
        const files = (formData ? Array.from(formData.getAll("files") as File[]) : (dataObj.files || [])) as File[];
        const uploadedFileUrl = dataObj.uploadedFileUrl || (formData ? formData.get("uploadedFileUrl") : null) as string | null;
        const uploadedFileName = dataObj.uploadedFileName || (formData ? formData.get("uploadedFileName") : null) as string | null;
        const uploadedFileSize = dataObj.uploadedFileSize || (formData ? formData.get("uploadedFileSize") : null) as string | null;
        const sharedFile: SharedFile[] = [];

        if (uploadedFileUrl && uploadedFileName) {
            // Use client-uploaded metadata
            sharedFile.push({
                fileName: uploadedFileName,
                fileUrl: uploadedFileUrl,
                fileSize: uploadedFileSize ? Number(uploadedFileSize) : 0,
                uploadedAt: new Date(),
            });
        } else {
            console.log("Processing server-side files:", files.length);

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
                    // Check file size - limit is 200 MB
                    if (file.size > 200 * 1024 * 1024) {
                        return NextResponse.json(
                            {
                                error: "File too large",
                                details: "File size must be less than 200 MB",
                            },
                            { status: 400 }
                        );
                    }

                    try {
                        console.log("Uploading file server-side:", file.name, file.size);
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
        }

        // Connect to MongoDB and ensure indexes
        console.log("Connecting to MongoDB...");
        const client = await clientPromise;
        const db = client.db("gist_clone");
        const collection = db.collection("user_gist");
        // Ensure indexes (idempotent)
        await ensureIndexes();

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
