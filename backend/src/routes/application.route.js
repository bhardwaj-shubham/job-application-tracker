import express from "express";

import verifyToken from "../middleware/auth.middleware.js";
import { createApplication } from "../controllers/application.controller.js";

const applicationRouter = express.Router();

applicationRouter.post("/", verifyToken, createApplication);

export default applicationRouter;
