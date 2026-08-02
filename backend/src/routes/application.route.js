import express from "express";

import verifyToken from "../middleware/auth.middleware.js";
import {
  createApplication,
  deleteApplicationById,
  getApplicationById,
  listAllApplications,
  updateApplicationById,
} from "../controllers/application.controller.js";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "../controllers/note.controller.js";

const applicationRouter = express.Router();

applicationRouter.post("/", verifyToken, createApplication);
applicationRouter.get("/", verifyToken, listAllApplications);
applicationRouter.get("/:id", verifyToken, getApplicationById);
applicationRouter.put("/:id", verifyToken, updateApplicationById);
applicationRouter.delete("/:id", verifyToken, deleteApplicationById);

applicationRouter.post("/:id/notes", verifyToken, createNote);
applicationRouter.get("/:id/notes", verifyToken, listNotes);
applicationRouter.delete("/:id/notes/:noteId", verifyToken, deleteNote);
applicationRouter.patch("/:id/notes/:noteId", verifyToken, updateNote);

export default applicationRouter;
