import { ExternalLinkIcon, FileTextIcon } from "lucide-react";

import type { ResumeDocument } from "@/services/documents/documentService";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ResumeDocumentCardProps = {
  document: ResumeDocument;
  onReplace: () => void;
  onDelete: () => void;
  deleting?: boolean;
};

const ResumeDocumentCard = ({
  document,
  onReplace,
  onDelete,
  deleting,
}: ResumeDocumentCardProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />

        <div className="min-w-0">
          <p className="truncate font-medium">{document.filename}</p>
          <p className="text-sm text-muted-foreground">Resume</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.open(document.url, "_blank")}
        >
          <ExternalLinkIcon />
          View
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onReplace}
          disabled={deleting}
        >
          Replace
        </Button>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button type="button" variant="destructive" disabled={deleting}>
                Delete
              </Button>
            }
          />

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete resume?</AlertDialogTitle>

              <AlertDialogDescription>
                This will permanently delete your uploaded resume for this
                application. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

              <AlertDialogAction
                variant="destructive"
                onClick={onDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ResumeDocumentCard;
