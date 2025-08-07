import { Router } from "express";
import userRoutes from "./user-routes.js";
import chatRoutes from "./chat-routes.js";

const appRouter = Router();

// API versioning
appRouter.use("/api/v1/user", userRoutes);
appRouter.use("/api/v1/chat", chatRoutes);

// Health check endpoint
appRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date() });
});

export default appRouter;