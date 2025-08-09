import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { COOKIE_NAME } from "./constants.js";
import type { StringValue } from "ms";

const getJwtSecret = (): Secret => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return process.env.JWT_SECRET as Secret;
};

export const createToken = (
  id: string,
  email: string,
  expiresIn: string
): string => {
  const payload = { id, email };
  const options: SignOptions = { expiresIn: "7d" as StringValue }; // explicitly typed
  return jwt.sign(payload, getJwtSecret(), options); // TS picks correct overload
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[COOKIE_NAME];

  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & {
      id: string;
      email: string;
    };
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
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload & {
      id: string;
      email: string;
    };
    const newToken = createToken(decoded.id, decoded.email, "7d"); // ✅ lowercase unit

    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    res.cookie(COOKIE_NAME, newToken, {
      path: "/",
      expires,
      httpOnly: true,
      signed: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
