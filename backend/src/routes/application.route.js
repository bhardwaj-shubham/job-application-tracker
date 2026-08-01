import express from "express";

import verifyToken from "../middleware/auth.middleware.js";
import {
  createApplication,
  getApplicationById,
  listAllApplications,
} from "../controllers/application.controller.js";

const applicationRouter = express.Router();

applicationRouter.post("/", verifyToken, createApplication);
applicationRouter.get("/", verifyToken, listAllApplications);
applicationRouter.get("/:id", verifyToken, getApplicationById);

export default applicationRouter;
