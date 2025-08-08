export const COOKIE_NAME = process.env.COOKIE_NAME || "auth_token";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const MONGO_OPTIONS = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Gemini-specific constants
export const GEMINI_MODELS = {
    "gemini-2.5-flash": "Gemini 2.5 Flash",
    "gemini-2.5-pro": "Gemini 2.5 Pro",
    "gemini-1.5-pro": "Gemini 1.5 Pro",
    "gemini-1.5-flash": "Gemini 1.5 Flash",
    "gemini-1.0-pro": "Gemini 1.0 Pro"
};