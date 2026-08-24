import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import errorHandlerMiddleware from "./middleware/errorHandler.middleware.js";
import authRouter from "./routes/auth.route.js";
import applicationRouter from "./routes/application.route.js";

import resumeAnalysisWorker from "./workers/resumeAnalysis.worker.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/applications", applicationRouter);

console.log("Resume analysis worker initialized");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await resumeAnalysisWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await resumeAnalysisWorker.close();
  process.exit(0);
});

app.use(errorHandlerMiddleware);

export default app;
