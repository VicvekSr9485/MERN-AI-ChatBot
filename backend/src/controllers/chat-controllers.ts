import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureGemini } from "../config/gemini-config.js";
import { getGeminiModel, formatGeminiMessages } from "../utils/geminiUtils.js";
import rateLimit from 'express-rate-limit';

// Add rate limiting middleware
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs
    message: "Too many chat requests, please try again later"
});

export const generateChatCompletion = [
    chatLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
        const { message } = req.body;
        
        // Input sanitization
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ message: "Invalid message format" });
        }

        try {
            const user = await User.findById(res.locals.jwtData.id);
            if (!user) {
                return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
            }

            // Initialize Gemini
            const genAI = configureGemini();
            const selectedModel = getGeminiModel("gemini-pro");
            const model = genAI.getGenerativeModel({ model: selectedModel });

            // Format chat history for Gemini
            const chatHistory = formatGeminiMessages(user.chats);

            // Start a chat with history
            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                },
            });

            // Add the new message to the user's chat history
            user.chats.push({ content: message, role: "user" });

            try {
                // Send message to Gemini
                const result = await chat.sendMessage(message);
                const response = await result.response;
                const text = response.text();
                
                // Add Gemini's response to the user's chat history
                const assistantMessage = {
                    role: "assistant",
                    content: text,
                    timestamp: new Date()
                };

                user.chats.push(assistantMessage);
                await user.save();
                
                return res.status(200).json({ chats: user.chats });
            } catch (geminiError: any) {
                console.error("Gemini API Error:", geminiError);
                
                // Handle specific Gemini errors
                if (geminiError.message?.includes('quota')) {
                    return res.status(429).json({ message: "Gemini API quota exceeded" });
                }
                
                return res.status(502).json({ message: "Failed to get response from AI service" });
            }
        } catch (error) {
            console.error("Chat completion error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message: "Something went wrong", cause: errorMessage });
        }
    }
];

export const sendChatsToUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
        }
        
        // Only return necessary fields
        const chats = user.chats.map(({ role, content, timestamp }) => ({
            role,
            content,
            timestamp
        }));
        
        return res.status(200).json({ message: "OK", chats });
    } catch (error) {
        console.error("Send chats error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
};

export const deleteChats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
        }
        
        // Fix: Use set() method to properly clear the DocumentArray
        user.set('chats', []);
        await user.save();
        return res.status(200).json({ message: "OK" });
    } catch (error) {
        console.error("Delete chats error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
};