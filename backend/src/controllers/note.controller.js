import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as noteService from "../services/note.service.js";

const createNote = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.validated.params;
  const { content } = req.validated.body;

  const note = await noteService.createNote({
    applicationId,
    userId: req.user.id,
    content,
  });

  if (!note) {
    throw new ApiError(404, "Application not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note added successfully"));
});

const listNotes = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.validated.params;

  const notes = await noteService.listNotes({
    applicationId,
    userId: req.user.id,
  });

  if (notes === null) {
    throw new ApiError(404, "Application not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { id: applicationId, noteId } = req.validated.params;

  const result = await noteService.deleteNote({
    applicationId,
    userId: req.user.id,
    noteId,
  });

  if (result.applicationNotFound) {
    throw new ApiError(404, "Application not found");
  }

  if (result.noteNotFound) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { id: applicationId, noteId } = req.validated.params;
  const { content } = req.validated.body;

  const result = await noteService.updateNote({
    applicationId,
    userId: req.user.id,
    noteId,
    content,
  });

  if (result.applicationNotFound) {
    throw new ApiError(404, "Application not found");
  }

  if (result.noteNotFound) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result.note, "Note updated successfully"));
});

export { createNote, listNotes, deleteNote, updateNote };
