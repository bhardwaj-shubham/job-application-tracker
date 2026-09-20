import express from "express";
import cors from "cors";
import env from "./config/env.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import errorHandlerMiddleware from "./middleware/errorHandler.middleware.js";
import globalRateLimit from "./middleware/rate-limit/globalRateLimit.middleware.js";
import authRouter from "./routes/auth.route.js";
import applicationRouter from "./routes/application.route.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(globalRateLimit);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/applications", applicationRouter);

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down...`);
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));

app.use(errorHandlerMiddleware);

export default app;
