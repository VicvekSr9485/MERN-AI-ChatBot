import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(requestLogger);
}

// API routes
app.use("/api/v1", appRouter);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

export default app;