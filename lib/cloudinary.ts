import { v2 as cloudinary } from "cloudinary";

// Validate required environment variables
const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.warn(
        `Cloudinary configuration incomplete. Missing: ${missingVars.join(', ')}. File uploads will be disabled.`
    );
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

export async function uploadToCloudinary(file: File): Promise<{
    url: string;
    publicId: string;
}> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error("Cloudinary is not configured. Please check your environment variables.");
    }

    // Validate file
    if (!file || file.size === 0) {
        throw new Error("Invalid file provided");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    resource_type: "auto",
                    folder: "gist-files",
                    access_mode: "public",
                    use_filename: true,
                    unique_filename: true,
                    // Only apply transformations for images
                    ...(file.type.startsWith('image/') ? {
                        quality: "auto",
                        format: "auto",
                    } : {}),
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(
                            new Error(`File upload failed: ${error.message}`)
                        );
                    } else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                        });
                    } else {
                        reject(new Error("Upload failed: No result returned"));
                    }
                }
            )
            .end(buffer);
    });
}

export default cloudinary;
