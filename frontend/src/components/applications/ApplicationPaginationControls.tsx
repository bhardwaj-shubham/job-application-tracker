import { Button } from "@/components/ui/button";

type ApplicationPaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPrevious: () => void;
  onNext: () => void;
};

const ApplicationPaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPrevious,
  onNext,
}: ApplicationPaginationControlsProps) => {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {totalItems === 0
          ? "No Applications"
          : `Showing ${startItem}-${endItem} of ${totalItems}`}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={onPrevious}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ApplicationPaginationControls;
