import { NextResponse } from "next/server";

export async function GET() {
    // Return Cloudinary config for client-side uploads
    // The upload preset must be created in Cloudinary dashboard
    return NextResponse.json({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "ml_default",
    });
}
