import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";
import rateLimit from "express-rate-limit";
import { setAuthCookie, clearAuthCookie } from "../utils/setAuthCookie.js";

// Rate limiters (unchanged)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later",
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many signup attempts, please try again later",
});

// Password strength validation (unchanged)
const isPasswordStrong = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const users = await User.find({}, { password: 0 }).skip(skip).limit(limit);
    const total = await User.countDocuments();
    return res.status(200).json({
      message: "OK",
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return res.status(500).json({ message: "ERROR", cause: errorMessage });
  }
};

import { Request, Response, NextFunction } from "express";

export const userSignup = [
  signupLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (!isPasswordStrong(password)) {
        return res.status(400).json({
          message:
            "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters",
        });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already registered" });
      }
      const hashedPassword = await hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();

      return res.status(201).json({
        message: "User registered successfully. Please login to continue.",
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
  },
];

export const userLogin = [
  loginLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      console.log("Login attempt for email:", email);
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isPasswordCorrect = await compare(password, user.password);
      if (!isPasswordCorrect) {
        console.log("Incorrect password for email:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not set");
        return res.status(500).json({ message: "Server configuration error" });
      }

      if (!process.env.COOKIE_SECRET) {
        console.error("COOKIE_SECRET is not set");
        return res.status(500).json({ message: "Server configuration error" });
      }

      // create token
      const token = createToken(user._id.toString(), user.email, "7d");

      // clear old cookie (matching flags; no domain)
      clearAuthCookie(res);

      // set new cookie using helper (no domain)
      setAuthCookie(res, token, { maxAge: 7 * 24 * 60 * 60 * 1000 });

      console.log("Login successful for email:", email);
      return res.status(200).json({
        message: "OK",
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ message: "ERROR", cause: errorMessage });
    }
  },
];

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not found or token expired" });
    }
    return res.status(200).json({
      message: "OK",
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Verify user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return res.status(500).json({ message: "ERROR", cause: errorMessage });
  }
};

export const userLogout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).json({ message: "User not found or token expired" });
    }

    // Clear cookie using helper (will use same flags)
    clearAuthCookie(res);

    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.error("Logout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return res.status(500).json({ message: "ERROR", cause: errorMessage });
  }
};
