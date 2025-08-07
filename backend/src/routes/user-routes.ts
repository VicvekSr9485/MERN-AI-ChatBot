import { Router } from "express";
import { getAllUsers, userLogin, userLogout, userSignup, verifyUser } from "../controllers/user-controller.js";
import { loginValidator, signUpValidator, validate } from "../utils/validators.js";
import { verifyToken } from "../utils/token-manager.js";

const userRoutes = Router();

// Public routes
userRoutes.post("/signup", validate(signUpValidator), userSignup);
userRoutes.post("/login", validate(loginValidator), userLogin);

// Protected routes
userRoutes.use(verifyToken);
userRoutes.get("/auth-status", verifyUser);
userRoutes.get("/logout", userLogout);

// Admin-only route (should be protected further)
userRoutes.get("/", getAllUsers);

export default userRoutes;