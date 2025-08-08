// backend/src/utils/token-manager.ts
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export const createToken = (id: string, email: string, expiresIn: string) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set");
    }
    
    const payload = { id, email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn
    });
    return token;
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.signedCookies[COOKIE_NAME];
    
    if (!token || token.trim() === "") {
        return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set");
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { id: string, email: string };
        res.locals.jwtData = decoded;
        return next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const refreshToken = (req: Request, res: Response) => {
    const token = req.signedCookies[COOKIE_NAME];
    
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set");
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & { id: string, email: string };
        const newToken = createToken(decoded.id, decoded.email, "7D");
        
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        
        res.cookie(COOKIE_NAME, newToken, {
            path: "/",
            domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
            expires,
            httpOnly: true,
            signed: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        
        return res.status(200).json({ message: "Token refreshed" });
    } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};