import * as noteRepository from "../repositories/note.repository.js";
import * as applicationRepository from "../repositories/application.repository.js";

const findOwnedApplication = async (applicationId, userId) => {
  const application = await applicationRepository.findById(
    applicationId,
    userId,
  );
  return application;
};

const createNote = async ({ applicationId, userId, content }) => {
  const application = await findOwnedApplication(applicationId, userId);
  if (!application) {
    return null;
  }

  return noteRepository.create({ applicationId, content });
};

const listNotes = async ({ applicationId, userId }) => {
  const application = await findOwnedApplication(applicationId, userId);
  if (!application) {
    return null;
  }

  return noteRepository.findMany(applicationId);
};

const updateNote = async ({ applicationId, userId, noteId, content }) => {
  const application = await findOwnedApplication(applicationId, userId);
  if (!application) {
    return { applicationNotFound: true };
  }

  const existingNote = await noteRepository.findById(noteId, applicationId);
  if (!existingNote) {
    return { noteNotFound: true };
  }

  const updatedNote = await noteRepository.updateById(noteId, content);
  return { note: updatedNote };
};

const deleteNote = async ({ applicationId, userId, noteId }) => {
  const application = await findOwnedApplication(applicationId, userId);
  if (!application) {
    return { applicationNotFound: true };
  }

  const existingNote = await noteRepository.findById(noteId, applicationId);
  if (!existingNote) {
    return { noteNotFound: true };
  }

  await noteRepository.deleteById(noteId);
  return { success: true };
};

export { createNote, listNotes, updateNote, deleteNote };
