import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import errorHandlerMiddleware from "./middleware/errorHandler.middleware.js";
import authRouter from "./routes/auth.route.js";
import applicationRouter from "./routes/application.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/applications", applicationRouter);

app.use(errorHandlerMiddleware);

export default app;
