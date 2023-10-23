import { connect, disconnect } from "mongoose";

export async function connectToDb() {
    try {
        await connect(process.env.MONGODB_URL);
    } catch (error) {
        console.log(error);
        throw new Error("Cannot connect to MongoDB")
    }
}

export async function disconnectFromDb() {
    try {
        await disconnect()
    } catch (error) {
        console.log(error);
        throw new Error("Could not disconnect from MongoDB")
    }
}
