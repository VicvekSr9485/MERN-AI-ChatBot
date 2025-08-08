import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import {
  deleteChats,
  generateChatCompletion,
  sendChatsToUser,
} from "../controllers/chat-controllers.js";

const chatRoutes = Router();

// All chat routes require authentication
chatRoutes.use(verifyToken);

chatRoutes.post(
  "/new",
  validate(chatCompletionValidator),
  generateChatCompletion
);

chatRoutes.get("/all-chats", sendChatsToUser);
chatRoutes.delete("/delete", deleteChats);

export default chatRoutes;