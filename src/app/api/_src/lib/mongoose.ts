import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || ""
if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
}

if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null }
}

const cached = global.mongooseCache

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, { bufferCommands: false })
            .then((m) => m)
    }

    cached.conn = await cached.promise
    return cached.conn
}
