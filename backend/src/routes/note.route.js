import express from "express";

import validate from "../middleware/validate.middleware.js";

import {
  createNote,
  listNotes,
  deleteNote,
  updateNote,
} from "../controllers/note.controller.js";
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdSchema,
} from "../validators/note.validator.js";

const noteRouter = express.Router();

noteRouter.post("/", validate(createNoteSchema), createNote);
noteRouter.get("/", listNotes);
noteRouter.delete("/:noteId", validate(noteIdSchema, "params"), deleteNote);
noteRouter.patch(
  "/:noteId",
  validate(noteIdSchema, "params"),
  validate(updateNoteSchema),
  updateNote,
);

export default noteRouter;
