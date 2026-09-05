import { apiClient } from "@/services/api/apiClient";

type Note = {
  id: string;
  applicationId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const createNote = async (
  applicationId: string,
  content: string,
): Promise<Note> => {
  const response = await apiClient<Note>(
    `/applications/${applicationId}/notes`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
  );

  return response.data;
};

const listNotes = async (applicationId: string): Promise<Note[]> => {
  const response = await apiClient<Note[]>(
    `/applications/${applicationId}/notes`,
  );

  return response.data;
};

const updateNote = async (
  applicationId: string,
  noteId: string,
  content: string,
): Promise<Note> => {
  const response = await apiClient<Note>(
    `/applications/${applicationId}/notes/${noteId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    },
  );

  return response.data;
};

const deleteNote = async (
  applicationId: string,
  noteId: string,
): Promise<void> => {
  await apiClient(`/applications/${applicationId}/notes/${noteId}`, {
    method: "DELETE",
  });
};

export { createNote, listNotes, updateNote, deleteNote, type Note };
