import clientPromise from "./mongodb";

export async function ensureIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("gist_clone");
    const collection = db.collection("user_gist");

    // Create indexes for common queries and text search
    await collection.createIndexes([
      { key: { userId: 1, createdAt: -1 }, name: "user_createdAt_idx" },
      { key: { visibility: 1, createdAt: -1 }, name: "visibility_createdAt_idx" },
      // Text index for searching descriptions and filenames (weights give more importance to filename)
      { key: { gistDescription: "text", fileNameWithExtension: "text" }, name: "text_search_idx", weights: { fileNameWithExtension: 5, gistDescription: 1 } },
    ]);

    console.log("Indexes ensured for user_gist collection");
  } catch (err) {
    console.error("Failed to ensure indexes:", err);
  }
}
