import { Router } from "express";
import { getAllUsers, userLogin, userSignup } from "../controllers/user-controller.js";
import { loginValidator, signUpValidator, validate } from "../utils/validators.js";

const userRoutes  = Router();

userRoutes.get("/", getAllUsers);
userRoutes.post("/signup", validate(signUpValidator), userSignup);
userRoutes.post("/login", validate(loginValidator), userLogin)

export default userRoutes;