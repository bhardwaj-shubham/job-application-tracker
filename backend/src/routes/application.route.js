import express from "express";

import verifyToken from "../middleware/auth.middleware.js";
import {
  createApplication,
  listAllApplication,
} from "../controllers/application.controller.js";

const applicationRouter = express.Router();

applicationRouter.post("/", verifyToken, createApplication);
applicationRouter.get("/", verifyToken, listAllApplication);

export default applicationRouter;
