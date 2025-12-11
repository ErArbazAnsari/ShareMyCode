import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier"; //
import fs from "fs";
import os from "os";
import path from "path";

// Ensure environment variables are loaded if using a package like dotenv
// require('dotenv').config();

if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    // In a production environment, you might want to throw an error
    // or stop the application if core services are misconfigured.
    console.error(
        "Cloudinary environment variables are missing. File uploads may be disabled or fail."
    );
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a single file (including large files) to Cloudinary.
 * @param file The file object (e.g., from an Express/Multer buffer or a client-side File API if used server-side).
 * @returns A promise that resolves with the secure URL and public ID.
 */
export async function uploadToCloudinary(file: File): Promise<{
    url: string;
    publicId: string;
}> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error("Cloudinary is not configured");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {



        // For files up to ~100MB, upload via stream which avoids writing to disk.
        // For larger files (e.g. up to 200MB as supported here), write to a temporary
        // file and use Cloudinary's `upload_large` which handles chunking server-side.
        const ONE_HUNDRED_MB = 100 * 1024 * 1024;

        if (buffer.length <= ONE_HUNDRED_MB) {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    folder: "gist-files",
                    access_mode: "public",
                    use_filename: true,
                    unique_filename: true,
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(new Error(`File upload failed: ${error.message}`));
                    } else {
                        resolve({
                            url: (result as UploadApiResponse).secure_url,
                            publicId: (result as UploadApiResponse).public_id,
                        });
                    }
                }
            );

            // Stream buffer to Cloudinary
            streamifier.createReadStream(buffer).pipe(stream);
        } else {
            // For larger files, write to a temp file and use upload_large with chunk_size
            const tmpDir = os.tmpdir();
            const tmpFilename = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const tmpPath = path.join(tmpDir, tmpFilename);

            // Write temp file then call upload_large
            fs.promises
                .writeFile(tmpPath, buffer)
                .then(() => {
                    cloudinary.uploader.upload_large(
                        tmpPath,
                        {
                            resource_type: "auto",
                            folder: "gist-files",
                            access_mode: "public",
                            use_filename: true,
                            unique_filename: true,
                            chunk_size: 6000000, // 6MB chunks to stay under 10MB limit
                        },
                        (error, result) => {
                            // Remove temp file regardless of outcome
                            fs.promises.unlink(tmpPath).catch(() => {});

                            if (error) {
                                console.error("Cloudinary large upload error:", error);
                                reject(new Error(`File upload failed: ${error.message}`));
                            } else {
                                resolve({
                                    url: (result as UploadApiResponse).secure_url,
                                    publicId: (result as UploadApiResponse).public_id,
                                });
                            }
                        }
                    );
                })
                .catch((fsErr) => {
                    // Clean up and fail
                    fs.promises.unlink(tmpPath).catch(() => {});
                    console.error("Error handling large file upload:", fsErr);
                    reject(new Error("Failed to process large file for upload"));
                });
        }
    });
}

/**
 * Uploads multiple files concurrently to Cloudinary.
 * @param files An array of File objects.
 * @returns A promise that resolves with an array of uploaded file details.
 */
export async function uploadMultipleToCloudinary(files: File[]): Promise<
    {
        url: string;
        publicId: string;
    }[]
> {
    // Create an array of promises for each file upload
    const uploadPromises = files.map((file) => uploadToCloudinary(file));

    try {
        // Wait for all promises to resolve concurrently
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error("Error during multiple file uploads:", error);
        throw new Error("One or more file uploads failed");
    }
}

export default cloudinary;
