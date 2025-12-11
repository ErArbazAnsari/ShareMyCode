import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import busboy from "busboy";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for large uploads

export async function POST(request: Request) {
    try {
        // Basic auth check via cookie
        const sessionCookie = request.headers.get("cookie");
        if (!sessionCookie || !sessionCookie.includes("__session")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contentType = request.headers.get("content-type") || "";
        
        return new Promise<NextResponse>(async (resolve) => {
            const bb = busboy({ headers: { "content-type": contentType } });
            const files: File[] = [];
            
            bb.on("file", (fieldname, fileStream, info) => {
                const { filename, mimeType } = info;
                const chunks: Uint8Array[] = [];
                
                fileStream.on("data", (chunk) => {
                    chunks.push(chunk);
                });
                
                fileStream.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    const file = new File([buffer], filename, { type: mimeType });
                    files.push(file);
                });
            });
            
            bb.on("finish", async () => {
                try {
                    if (files.length === 0) {
                        resolve(NextResponse.json({ error: "No files provided" }, { status: 400 }));
                        return;
                    }
                    
                    if (files.length > 1) {
                        resolve(NextResponse.json({ error: "Only one file allowed" }, { status: 400 }));
                        return;
                    }
                    
                    const file = files[0];
                    const MAX_BYTES = 100 * 1024 * 1024; // 100MB
                    if (file.size > MAX_BYTES) {
                        resolve(NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 }));
                        return;
                    }
                    
                    // Upload to Cloudinary (handles chunking internally for large files)
                    const uploadResult = await uploadToCloudinary(file);
                    
                    resolve(NextResponse.json({
                        success: true,
                        file: {
                            fileName: file.name,
                            fileUrl: uploadResult.url,
                            fileSize: file.size,
                            publicId: uploadResult.publicId,
                        },
                    }));
                } catch (err) {
                    console.error("Error uploading to Cloudinary:", err);
                    resolve(NextResponse.json({ 
                        error: err instanceof Error ? err.message : "Upload failed" 
                    }, { status: 500 }));
                }
            });
            
            bb.on("error", (err) => {
                console.error("Busboy error:", err);
                resolve(NextResponse.json({ error: "Failed to parse upload" }, { status: 500 }));
            });
            
            const reader = request.body?.getReader();
            if (!reader) {
                resolve(NextResponse.json({ error: "No request body" }, { status: 400 }));
                return;
            }
            
            const stream = new Readable({
                async read() {
                    const { done, value } = await reader.read();
                    if (done) {
                        this.push(null);
                    } else {
                        this.push(value);
                    }
                },
            });
            
            stream.pipe(bb);
        });
    } catch (err) {
        console.error("Error in chunked upload route:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
