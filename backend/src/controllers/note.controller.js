import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createNote = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.params;
  const { content } = req.body || {};

  if (!content?.trim()) {
    throw new ApiError(400, "Note content is required");
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: req.user.id },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const note = await prisma.note.create({
    data: { applicationId, content: content.trim() },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note added successfully"));
});

const listNotes = asyncHandler(async (req, res) => {
  const { id: applicationId } = req.params;

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: req.user.id },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const notes = await prisma.note.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { id: applicationId, noteId } = req.params;

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: req.user.id },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const note = await prisma.note.findFirst({
    where: { id: noteId, applicationId },
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  await prisma.note.delete({
    where: { id: noteId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Note deleted successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { id: applicationId, noteId } = req.params;
  const { content } = req.body || {};

  if (!content?.trim()) {
    throw new ApiError(400, "Note content is required");
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId: req.user.id },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const note = await prisma.note.findFirst({
    where: { id: noteId, applicationId },
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: { content: content.trim() },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

export { createNote, listNotes, deleteNote, updateNote };
