export const COOKIE_NAME = process.env.COOKIE_NAME || "auth_token";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const MONGO_OPTIONS = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};