import mongoose from 'mongoose';

// Extract the required functions from the default export
const { connect, disconnect, connection } = mongoose;

const connectOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

export async function connectToDb() {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL environment variable is not set");
        }
        
        const conn = await connect(process.env.MONGODB_URL, connectOptions);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw new Error("Cannot connect to MongoDB");
    }
}

export async function disconnectFromDb() {
    try {
        await disconnect();
        console.log("MongoDB Disconnected");
    } catch (error) {
        console.error("MongoDB disconnection error:", error);
        throw new Error("Could not disconnect from MongoDB");
    }
}

// Handle connection events
connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});

connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});