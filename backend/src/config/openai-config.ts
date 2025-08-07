import { Configuration } from "openai";

export const configureOpenAI = () => {
    if (!process.env.OPEN_AI_SECRET) {
        throw new Error("OPEN_AI_SECRET environment variable is not set");
    }
    
    const config = new Configuration({
        apiKey: process.env.OPEN_AI_SECRET,
        organization: process.env.OPEN_AI_ORGANIZATION_ID || undefined, // Make organization optional
    });
    
    return config;
}