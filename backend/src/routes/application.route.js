import express from "express";

import verifyToken from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";

import noteRouter from "./note.route.js";
import documentRouter from "./document.route.js";

import {
  createApplicationSchema,
  listApplicationsQuerySchema,
  applicationIdSchema,
  updateApplicationSchema,
} from "../validators/application.validator.js";

import {
  createApplication,
  deleteApplicationById,
  getApplicationById,
  listAllApplications,
  updateApplicationById,
} from "../controllers/application.controller.js";

import {
  analyzeResume,
  getResumeAnalysisStatus,
} from "../controllers/resumeAnalysis.controller.js";

const applicationRouter = express.Router();

applicationRouter.use(verifyToken);

applicationRouter.post(
  "/",
  validate(createApplicationSchema),
  createApplication,
);
applicationRouter.get(
  "/",
  validate(listApplicationsQuerySchema, "query"),
  listAllApplications,
);
applicationRouter.get(
  "/:id",
  validate(applicationIdSchema, "params"),
  getApplicationById,
);
applicationRouter.patch(
  "/:id",
  validate(applicationIdSchema, "params"),
  validate(updateApplicationSchema),
  updateApplicationById,
);
applicationRouter.delete(
  "/:id",
  validate(applicationIdSchema, "params"),
  deleteApplicationById,
);
applicationRouter.post(
  "/:id/analyze",
  validate(applicationIdSchema, "params"),
  analyzeResume,
);
applicationRouter.get(
  "/:id/analyze",
  validate(applicationIdSchema, "params"),
  getResumeAnalysisStatus,
);

applicationRouter.use(
  "/:id/notes",
  validate(applicationIdSchema, "params"),
  noteRouter,
);

applicationRouter.use(
  "/:id/documents",
  validate(applicationIdSchema, "params"),
  documentRouter,
);

export default applicationRouter;
