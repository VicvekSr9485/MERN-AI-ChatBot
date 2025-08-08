import { GoogleGenerativeAI } from "@google/generative-ai";

export const configureGemini = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};