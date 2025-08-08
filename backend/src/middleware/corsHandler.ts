import { Request, Response, NextFunction } from "express";

export const corsHandler = (req: Request, res: Response, next: NextFunction) => {
  // Set CORS headers
  res.header("Access-Control-Allow-Origin", "https://mern-ai-assistant.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
};