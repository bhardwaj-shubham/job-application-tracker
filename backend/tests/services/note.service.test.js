import { describe, it, expect, vi, beforeEach } from "vitest";
import * as noteRepository from "../../src/repositories/note.repository.js";
import * as applicationRepository from "../../src/repositories/application.repository.js";
import {
  createNote,
  listNotes,
  updateNote,
  deleteNote,
} from "../../src/services/note.service.js";

vi.mock("../../src/repositories/note.repository.js", () => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findById: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn(),
}));

vi.mock("../../src/repositories/application.repository.js", () => ({
  findById: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("note.service - createNote", () => {
  it("returns null when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await createNote({
      applicationId: "app-1",
      userId: "user-1",
      content: "Recruiter called",
    });

    expect(applicationRepository.findById).toHaveBeenCalledWith(
      "app-1",
      "user-1",
    );
    expect(noteRepository.create).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("creates the note when application exists", async () => {
    applicationRepository.findById.mockResolvedValue({
      id: "app-1",
      userId: "user-1",
    });
    const createdNote = {
      id: "note-1",
      applicationId: "app-1",
      content: "Recruiter called",
    };
    noteRepository.create.mockResolvedValue(createdNote);

    const result = await createNote({
      applicationId: "app-1",
      userId: "user-1",
      content: "Recruiter called",
    });

    expect(noteRepository.create).toHaveBeenCalledWith({
      applicationId: "app-1",
      content: "Recruiter called",
    });
    expect(result).toEqual(createdNote);
  });
});

describe("note.service - listNotes", () => {
  it("returns null when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await listNotes({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(noteRepository.findMany).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns notes when application exists", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    const notes = [{ id: "note-1" }, { id: "note-2" }];
    noteRepository.findMany.mockResolvedValue(notes);

    const result = await listNotes({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(noteRepository.findMany).toHaveBeenCalledWith("app-1");
    expect(result).toEqual(notes);
  });

  it("returns an empty array (not null) when application has no notes", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    noteRepository.findMany.mockResolvedValue([]);

    const result = await listNotes({
      applicationId: "app-1",
      userId: "user-1",
    });

    expect(result).toEqual([]);
    expect(result).not.toBeNull();
  });
});

describe("note.service - updateNote", () => {
  it("returns applicationNotFound when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await updateNote({
      applicationId: "app-1",
      userId: "user-1",
      noteId: "note-1",
      content: "Updated",
    });

    expect(noteRepository.findById).not.toHaveBeenCalled();
    expect(result).toEqual({ applicationNotFound: true });
  });

  it("returns noteNotFound when note does not exist for this application", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    noteRepository.findById.mockResolvedValue(null);

    const result = await updateNote({
      applicationId: "app-1",
      userId: "user-1",
      noteId: "note-1",
      content: "Updated",
    });

    expect(noteRepository.updateById).not.toHaveBeenCalled();
    expect(result).toEqual({ noteNotFound: true });
  });

  it("updates the note when both application and note exist", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    noteRepository.findById.mockResolvedValue({
      id: "note-1",
      applicationId: "app-1",
    });
    const updatedNote = { id: "note-1", content: "Updated" };
    noteRepository.updateById.mockResolvedValue(updatedNote);

    const result = await updateNote({
      applicationId: "app-1",
      userId: "user-1",
      noteId: "note-1",
      content: "Updated",
    });

    expect(noteRepository.updateById).toHaveBeenCalledWith("note-1", "Updated");
    expect(applicationRepository.findById).toHaveBeenCalledWith(
      "app-1",
      "user-1",
    );
    expect(result).toEqual({ note: updatedNote });
  });
});

describe("note.service - deleteNote", () => {
  it("returns applicationNotFound when application does not exist", async () => {
    applicationRepository.findById.mockResolvedValue(null);

    const result = await deleteNote({
      applicationId: "app-1",
      userId: "user-1",
      noteId: "note-1",
    });

    expect(noteRepository.findById).not.toHaveBeenCalled();
    expect(result).toEqual({ applicationNotFound: true });
  });

  it("returns noteNotFound when note does not exist for this application", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    noteRepository.findById.mockResolvedValue(null);

    const result = await deleteNote({
      applicationId: "app-1",
      userId: "user-1",
      noteId: "note-1",
    });

    expect(noteRepository.deleteById).not.toHaveBeenCalled();
    expect(result).toEqual({ noteNotFound: true });
  });

  it("deletes the note when both application and note exist", async () => {
    applicationRepository.findById.mockResolvedValue({ id: "app-1" });
    noteRepository.findById.mockResolvedValue({
      id: "note-1",
      applicationId: "app-1",
    });
    noteRepository.deleteById.mockResolvedValue({ id: "note-1" });

    const result = await deleteNote({
      applicationId: "app-1",
      userId: "user-1",
      noteId: "note-1",
    });

    expect(noteRepository.deleteById).toHaveBeenCalledWith("note-1");
    expect(result).toEqual({ success: true });
  });
});
