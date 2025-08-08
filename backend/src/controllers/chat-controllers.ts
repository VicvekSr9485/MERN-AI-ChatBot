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
            const selectedModel = getGeminiModel("gemini-2.5-flash");
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
            
            try {
                // Send message to Gemini
                const result = await chat.sendMessage(message);
                const response = await result.response;
                const text = response.text();
                
                // Validate the AI response
                if (!text || text.trim().length === 0) {
                    console.error("Empty response from Gemini API");
                    return res.status(502).json({ message: "AI service returned empty response" });
                }
                
                // Add user message to chats array using DocumentArray methods
                user.chats.push({ 
                    content: message, 
                    role: "user", 
                    timestamp: new Date() 
                });
                
                // Add AI response to chats array using DocumentArray methods
                user.chats.push({ 
                    content: text, 
                    role: "assistant", 
                    timestamp: new Date() 
                });
                
                // Save the user with the updated chats
                await user.save();
                
                return res.status(200).json({ chats: user.chats });
            } catch (geminiError: any) {
                console.error("Gemini API Error:", geminiError);
                
                // Handle specific Gemini errors
                if (geminiError.message?.includes('quota')) {
                    return res.status(429).json({ message: "Gemini API quota exceeded" });
                }
                
                // Handle model not found error
                if (geminiError.message?.includes('not found') || geminiError.message?.includes('404')) {
                    // Try fallback model
                    try {
                        console.log("Primary model failed, trying fallback model");
                        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
                        const fallbackChat = fallbackModel.startChat({
                            history: chatHistory,
                            generationConfig: {
                                maxOutputTokens: 1000,
                                temperature: 0.7,
                            },
                        });
                        
                        const fallbackResult = await fallbackChat.sendMessage(message);
                        const fallbackResponse = await fallbackResult.response;
                        const fallbackText = fallbackResponse.text();
                        
                        // Validate the fallback AI response
                        if (!fallbackText || fallbackText.trim().length === 0) {
                            console.error("Empty response from fallback Gemini model");
                            return res.status(502).json({ message: "AI service returned empty response" });
                        }
                        
                        // Add user message to chats array using DocumentArray methods
                        user.chats.push({ 
                            content: message, 
                            role: "user", 
                            timestamp: new Date() 
                        });
                        
                        // Add AI response to chats array using DocumentArray methods
                        user.chats.push({ 
                            content: fallbackText, 
                            role: "assistant", 
                            timestamp: new Date() 
                        });
                        
                        // Save the user with the updated chats
                        await user.save();
                        
                        return res.status(200).json({ chats: user.chats });
                    } catch (fallbackError: any) {
                        console.error("Fallback model also failed:", fallbackError);
                        
                        // Try a second fallback model
                        try {
                            console.log("Second fallback model attempt");
                            const secondFallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                            const secondFallbackChat = secondFallbackModel.startChat({
                                history: chatHistory,
                                generationConfig: {
                                    maxOutputTokens: 1000,
                                    temperature: 0.7,
                                },
                            });
                            
                            const secondFallbackResult = await secondFallbackChat.sendMessage(message);
                            const secondFallbackResponse = await secondFallbackResult.response;
                            const secondFallbackText = secondFallbackResponse.text();
                            
                            // Validate the second fallback AI response
                            if (!secondFallbackText || secondFallbackText.trim().length === 0) {
                                console.error("Empty response from second fallback Gemini model");
                                return res.status(502).json({ message: "AI service returned empty response" });
                            }
                            
                            // Add user message to chats array using DocumentArray methods
                            user.chats.push({ 
                                content: message, 
                                role: "user", 
                                timestamp: new Date() 
                            });
                            
                            // Add AI response to chats array using DocumentArray methods
                            user.chats.push({ 
                                content: secondFallbackText, 
                                role: "assistant", 
                                timestamp: new Date() 
                            });
                            
                            // Save the user with the updated chats
                            await user.save();
                            
                            return res.status(200).json({ chats: user.chats });
                        } catch (secondFallbackError: any) {
                            console.error("Second fallback model also failed:", secondFallbackError);
                            
                            // Try a third fallback model
                            try {
                                console.log("Third fallback model attempt");
                                const thirdFallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                                const thirdFallbackChat = thirdFallbackModel.startChat({
                                    history: chatHistory,
                                    generationConfig: {
                                        maxOutputTokens: 1000,
                                        temperature: 0.7,
                                    },
                                });
                                
                                const thirdFallbackResult = await thirdFallbackChat.sendMessage(message);
                                const thirdFallbackResponse = await thirdFallbackResult.response;
                                const thirdFallbackText = thirdFallbackResponse.text();
                                
                                // Validate the third fallback AI response
                                if (!thirdFallbackText || thirdFallbackText.trim().length === 0) {
                                    console.error("Empty response from third fallback Gemini model");
                                    return res.status(502).json({ message: "AI service returned empty response" });
                                }
                                
                                // Add user message to chats array using DocumentArray methods
                                user.chats.push({ 
                                    content: message, 
                                    role: "user", 
                                    timestamp: new Date() 
                                });
                                
                                // Add AI response to chats array using DocumentArray methods
                                user.chats.push({ 
                                    content: thirdFallbackText, 
                                    role: "assistant", 
                                    timestamp: new Date() 
                                });
                                
                                // Save the user with the updated chats
                                await user.save();
                                
                                return res.status(200).json({ chats: user.chats });
                            } catch (thirdFallbackError: any) {
                                console.error("Third fallback model also failed:", thirdFallbackError);
                                return res.status(502).json({ message: "Failed to get response from AI service" });
                            }
                        }
                    }
                }
                
                // Handle network errors
                if (geminiError.code === 'ECONNREFUSED' || geminiError.code === 'ENOTFOUND') {
                    return res.status(502).json({ message: "Failed to connect to AI service" });
                }
                
                return res.status(502).json({ message: "Failed to get response from AI service" });
            }
        } catch (error) {
            console.error("Chat completion error:", error);
            
            // Handle Mongoose validation errors
            if (error instanceof Error && error.name === 'ValidationError') {
                console.error("Validation Error:", error.message);
                return res.status(400).json({ 
                    message: "Validation error", 
                    cause: error.message 
                });
            }
            
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message: "Something went wrong", cause: errorMessage });
        }
    }
];

export const sendChatsToUser = async (req: Request, res: Response, next: NextFunction) => {
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

export const deleteChats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not registered OR Token malfunctioned" });
        }
        
        // Use set() method to properly clear the DocumentArray
        user.set('chats', []);
        await user.save();
        return res.status(200).json({ message: "OK" });
    } catch (error) {
        console.error("Delete chats error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
};