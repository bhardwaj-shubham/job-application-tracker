import express from "express";
import cors from "cors";
import "dotenv/config";

import errorHandlerMiddleware from "./src/middleware/errorHandler.middleware.js";
import authRouter from "./src/routes/auth.route.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => console.log(`server listening on PORT:${PORT}`));
