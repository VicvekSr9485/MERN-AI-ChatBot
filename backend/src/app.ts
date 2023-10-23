import express from "express";
import { config } from "dotenv";
import morgan from "morgan";

config();
const app = express();

// middlewares
app.use(express.json());
//to be removed in production
app.use(morgan("dev"));

export default app;