import { useState } from "react";

import type {
  Application,
  UpdateApplicationData,
} from "@/services/applications/applicationService";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import ApplicationForm from "./ApplicationForm";
import { FileTextIcon } from "lucide-react";

type EditApplicationSheetProps = {
  application: Application;
  onSubmit: (data: UpdateApplicationData) => Promise<void>;
};

const EditApplicationSheet = ({
  application,
  onSubmit,
}: EditApplicationSheetProps) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: UpdateApplicationData) => {
    await onSubmit(data);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="secondary"
            className="p-2 w-full md:w-1/10 rounded-lg hover:cursor-pointer border-gray-400 font-medium"
          >
            <FileTextIcon />
            Edit
          </Button>
        }
      />

      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Application</SheetTitle>
          <SheetDescription>
            Update the details of this job application.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6">
          <ApplicationForm
            mode="edit"
            initialValues={{
              company: application.company,
              role: application.role,
              status: application.status,
              appliedDate: new Date(application.appliedDate),
              jobUrl: application.jobUrl ?? "",
              jobDescription: application.jobDescription ?? "",
            }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditApplicationSheet;
