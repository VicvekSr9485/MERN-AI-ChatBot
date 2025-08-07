import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { OpenAIApi, ChatCompletionRequestMessage } from "openai";

// Add rate limiting middleware
import rateLimit from 'express-rate-limit';

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

            // Limit chat history to prevent memory issues
            const maxHistoryLength = 50;
            const chats = user.chats.slice(-maxHistoryLength).map(({ role, content }) => ({
                role,
                content,
            })) as ChatCompletionRequestMessage[];
            
            chats.push({ content: message, role: "user" });
            user.chats.push({ content: message, role: "user" });

            const config = configureOpenAI();
            const openai = new OpenAIApi(config);

            try {
                const chatResponse = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: chats,
                    max_tokens: 1000, // Add token limit
                    temperature: 0.7, // Add temperature control
                });

                const assistantMessage = chatResponse.data.choices[0].message;
                if (!assistantMessage) {
                    throw new Error("No response from OpenAI");
                }

                user.chats.push(assistantMessage);
                await user.save();
                
                return res.status(200).json({ chats: user.chats });
            } catch (openaiError: any) {
                console.error("OpenAI API Error:", openaiError.response?.data || openaiError.message);
                
                // Handle specific OpenAI errors
                if (openaiError.response?.status === 429) {
                    return res.status(429).json({ message: "OpenAI API rate limit exceeded" });
                }
                
                return res.status(502).json({ message: "Failed to get response from AI service" });
            }
        } catch (error) {
            console.error("Chat completion error:", error);
            return res.status(500).json({ message: "Something went wrong" });
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
        return res.status(500).json({ message: "ERROR", cause: error.message });
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
        
        user.chats.splice(0, user.chats.length);
        await user.save();
        return res.status(200).json({ message: "OK" });
    } catch (error) {
        console.error("Delete chats error:", error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};