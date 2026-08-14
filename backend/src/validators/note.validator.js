import { z } from "zod";

const noteContentSchema = z
  .string()
  .trim()
  .min(1, "Note content is required")
  .max(5000, "Note content must not exceed 5000 characters");

const createNoteSchema = z.object({
  content: noteContentSchema,
});

const updateNoteSchema = z.object({
  content: noteContentSchema,
});

const noteIdSchema = z.object({
  noteId: z.string().trim().min(1, "Note ID is required"),
});

export { createNoteSchema, updateNoteSchema, noteIdSchema };
