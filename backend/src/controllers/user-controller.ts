// user-controller.ts
import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";
import rateLimit from 'express-rate-limit';

// Rate limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts, please try again later"
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 signup attempts per hour
    message: "Too many signup attempts, please try again later"
});

// Password strength validation
const isPasswordStrong = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
};

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Add pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        const users = await User.find({}, { password: 0 }) // Exclude password
            .skip(skip)
            .limit(limit);
            
        const total = await User.countDocuments();
        
        return res.status(200).json({ 
            message: "OK", 
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get all users error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
};

export const userSignup = [
    signupLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password } = req.body;
            
            // Input validation
            if (!name || !email || !password) {
                return res.status(400).json({ message: "All fields are required" });
            }
            
            if (!isPasswordStrong(password)) {
                return res.status(400).json({ 
                    message: "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters" 
                });
            }
            
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: "User already registered" });
            }
            
            const hashedPassword = await hash(password, 10);
            const user = new User({ name, email, password: hashedPassword });
            await user.save();

            // Create token and store cookie
            const token = createToken(user._id.toString(), user.email, "7d");
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);
            
            // Clear existing cookie first
            res.clearCookie(COOKIE_NAME, {
                httpOnly: true,
                signed: true,
                path: "/",
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            
            // Set new cookie
            res.cookie(COOKIE_NAME, token, {
                path: "/",
                domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
                expires,
                httpOnly: true,
                signed: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            
            return res.status(201).json({ 
                message: "OK", 
                name: user.name, 
                email: user.email 
            });
        } catch (error) {
            console.error("Signup error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message: "ERROR", cause: errorMessage });
        }
    }
];

export const userLogin = [
    loginLimiter,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            
            // Input validation
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }
            
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            
            const isPasswordCorrect = await compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            
            // Create token and store cookie
            const token = createToken(user._id.toString(), user.email, "7d");
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);
            
            // Clear existing cookie first
            res.clearCookie(COOKIE_NAME, {
                httpOnly: true,
                signed: true,
                path: "/",
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            
            // Set new cookie
            res.cookie(COOKIE_NAME, token, {
                path: "/",
                domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
                expires,
                httpOnly: true,
                signed: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            
            return res.status(200).json({ 
                message: "OK", 
                name: user.name, 
                email: user.email 
            });
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            return res.status(500).json({ message: "ERROR", cause: errorMessage });
        }
    }
];

export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not found or token expired" });
        }
        
        return res.status(200).json({ 
            message: "OK", 
            name: user.name, 
            email: user.email 
        });
    } catch (error) {
        console.error("Verify user error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
};

export const userLogout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(401).json({ message: "User not found or token expired" });
        }
        
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            signed: true,
            path: "/",
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        
        return res.status(200).json({ message: "OK" });
    } catch (error) {
        console.error("Logout error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
};