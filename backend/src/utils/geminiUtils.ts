import { GEMINI_MODELS } from "./constants.js";

export const getGeminiModel = (model: string = "gemini-2.5-flash") => {
    if (!GEMINI_MODELS[model as keyof typeof GEMINI_MODELS]) {
        console.warn(`Unknown Gemini model: ${model}. Defaulting to gemini-2.5-flash`);
        return "gemini-2.5-flash";
    }
    return model;
};

export const formatGeminiMessages = (messages: Array<{role: string, content: string}>) => {
    // Format messages according to Gemini's requirements
    return messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }));
};