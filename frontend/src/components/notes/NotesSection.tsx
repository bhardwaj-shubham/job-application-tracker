import { useEffect, useState } from "react";

import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
  type Note,
} from "@/services/notes/noteService";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type NotesSectionProps = {
  applicationId: string;
};

const NotesSection = ({ applicationId }: NotesSectionProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [updating, setUpdating] = useState(false);

  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await listNotes(applicationId);

        setNotes(result);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load notes. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [applicationId]);

  const handleAddNote = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    try {
      setAdding(true);
      setError("");

      const note = await createNote(applicationId, trimmedContent);

      setNotes((previous) => [note, ...previous]);
      setContent("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to add note. Please try again.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
    setError("");
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingContent("");
  };

  const handleUpdateNote = async () => {
    if (!editingNoteId) return;

    const trimmedContent = editingContent.trim();

    if (!trimmedContent) return;

    try {
      setUpdating(true);
      setError("");

      const updatedNote = await updateNote(
        applicationId,
        editingNoteId,
        trimmedContent,
      );

      setNotes((previous) =>
        previous.map((note) =>
          note.id === updatedNote.id ? updatedNote : note,
        ),
      );

      setEditingNoteId(null);
      setEditingContent("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update Note. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNoteId) return;

    try {
      setDeleting(true);
      setError("");

      await deleteNote(applicationId, deletingNoteId);

      setNotes((previous) =>
        previous.filter((note) => note.id !== deletingNoteId),
      );

      setDeletingNoteId(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete note. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold">Notes</h2>
        <p className="text-sm text-muted-foreground">
          Keep notes and reminders about this application.
        </p>
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Write a note..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={adding}
        />

        <Button
          type="button"
          onClick={handleAddNote}
          disabled={adding || !content.trim()}
        >
          {adding ? "Adding..." : "Add Note"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <p className="text-sm text-muted-foreground">Loading notes...</p>
      )}

      {!loading && !error && notes.length === 0 && (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      )}

      {!loading && notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border-b pb-4 last:border-b-0">
              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    disabled={updating}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleUpdateNote}
                      disabled={updating || !editingContent.trim()}
                    >
                      {updating ? "Saving..." : "Save"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancelEditNote}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>

                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingNoteId(note.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={deletingNoteId !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeletingNoteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>

            <AlertDialogDescription>
              This note will be permanently deleted. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDeleteNote} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default NotesSection;
