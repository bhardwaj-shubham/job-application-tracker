import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import type { Application } from "@/services/applications/applicationService";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type ApplicationTableProps = {
  applications: Application[];
  onRowClick: (application: Application) => void;
};

const features = tableFeatures({});
type ApplicationTableFeatures = typeof features;

const columnHelper = createColumnHelper<
  ApplicationTableFeatures,
  Application
>();

const columns = columnHelper.columns([
  columnHelper.accessor("company", {
    header: "Company",
  }),

  columnHelper.accessor("role", {
    header: "Role",
  }),

  columnHelper.accessor("status", {
    header: "Status",
  }),

  columnHelper.accessor("appliedDate", {
    header: "Applied Date",
    cell: (info) => {
      return new Date(info.getValue()).toLocaleDateString();
    },
  }),
]);

const ApplicationTable = ({
  applications,
  onRowClick,
}: ApplicationTableProps) => {
  const table = useTable({
    key: "applications-table",
    features,
    columns,
    data: applications,
  });

  return (
    <div className="overflow-x-auto rounded-md border my-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => onRowClick(row.original)}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No applications found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationTable;
