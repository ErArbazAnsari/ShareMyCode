import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Configure cloudinary if not already configured (it might be in lib/cloudinary, but we need to be sure)
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const timestamp = Math.round(new Date().getTime() / 1000);
        const folder = "gist-files";

        // Generate signature
        // We need to sign the parameters we will send.
        // For a basic upload: timestamp, folder.
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder,
            },
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        });
    } catch (error) {
        console.error("Error generating signature:", error);
        return NextResponse.json(
            { error: "Failed to generate upload signature" },
            { status: 500 }
        );
    }
}
