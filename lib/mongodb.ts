import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
    // Native MongoDB driver options
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain minimum 2 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    // Add retry options
    retryWrites: true,
    retryReads: true,
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

clientPromise.catch((error) => {
    console.error("MongoDB connection error:", error);
    console.error("Please check:");
    console.error("1. MongoDB Atlas cluster is not paused");
    console.error("2. Network allows connections to MongoDB Atlas");
    console.error("3. IP whitelist includes your current IP");
    console.error("4. Connection string is correct");
});

export default clientPromise;
