"use client";

import { useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Globe,
  Lock,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExercises, useImportExercises, useExportExercises } from "@/features/exercises/hooks/use-exercises";
import { ExerciseFormDrawer } from "@/features/exercises/components/exercise-form-drawer";
import { DeleteExerciseDialog } from "@/features/exercises/components/delete-exercise-dialog";
import type { Exercise } from "@/features/exercises/types";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Exercise>();

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ExercisesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExercise, setDeleteExercise] = useState<Exercise | null>(null);

  const importFileRef = useRef<HTMLInputElement>(null);
  const { mutate: runImport, isPending: isImporting } = useImportExercises();
  const { mutate: runExport, isPending: isExporting } = useExportExercises();

  const { data, isLoading, isFetching, refetch } = useExercises({
    page,
    limit: 20,
    search: search || undefined,
  });

  const exercises = data?.data ?? [];
  const meta = data?.meta;

  function openCreate() {
    setEditExercise(null);
    setDrawerOpen(true);
  }

  function openEdit(exercise: Exercise) {
    setEditExercise(exercise);
    setDrawerOpen(true);
  }

  function openDelete(exercise: Exercise) {
    setDeleteExercise(exercise);
    setDeleteOpen(true);
  }

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <SortHeader
          label="Name"
          sorted={column.getIsSorted()}
          onClick={column.getToggleSortingHandler()}
        />
      ),
      cell: ({ row }) => {
        const ex = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {ex.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ex.image_url}
                  alt={ex.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  {ex.name[0]}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{ex.name}</span>
              {ex.description && (
                <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
                  {ex.description}
                </span>
              )}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("slug", {
      header: "Slug",
      cell: ({ getValue }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {getValue()}
        </code>
      ),
    }),
    columnHelper.accessor("visibility", {
      header: "Visibility",
      cell: ({ getValue }) => {
        const v = getValue();
        return v === "public" ? (
          <Badge variant="secondary" className="gap-1 font-normal">
            <Globe className="size-3" />
            Public
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
            <Lock className="size-3" />
            Private
          </Badge>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: ({ column }) => (
        <SortHeader
          label="Created"
          sorted={column.getIsSorted()}
          onClick={column.getToggleSortingHandler()}
        />
      ),
      cell: ({ getValue }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatDate(getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => openDelete(row.original)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: exercises,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exercises…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </form>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runExport()}
            disabled={isExporting}
          >
            <RefreshCw className={cn("size-3.5", isExporting ? "animate-spin" : "hidden")} />
            <Download className={cn("size-3.5", isExporting && "hidden")} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => importFileRef.current?.click()}
            disabled={isImporting}
          >
            <RefreshCw className={cn("size-3.5", isImporting ? "animate-spin" : "hidden")} />
            <Upload className={cn("size-3.5", isImporting && "hidden")} />
            Import CSV
          </Button>
          <input
            ref={importFileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) runImport(file);
              e.target.value = "";
            }}
          />
          <Button onClick={openCreate} size="sm">
            <Plus className="size-4" />
            New exercise
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-muted/40">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-9 px-3 text-left text-xs font-medium text-muted-foreground"
                    >
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5" colSpan={columns.length}>
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : exercises.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-sm text-muted-foreground"
                  >
                    {search
                      ? `No exercises found for "${search}".`
                      : "No exercises yet. Create your first one."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {meta.totalCount} exercises &middot; page {meta.page} of{" "}
              {meta.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setPage((p) => Math.min(meta.totalPages, p + 1))
                }
                disabled={page === meta.totalPages || isFetching}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ExerciseFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        exercise={editExercise}
      />
      <DeleteExerciseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        exercise={deleteExercise}
      />
    </>
  );
}

function SortHeader({
  label,
  sorted,
  onClick,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick?: (e: unknown) => void;
}) {
  return (
    <button
      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      {label}
      {sorted === false && <ArrowUpDown className="size-3" />}
      {sorted === "asc" && <ArrowUp className="size-3" />}
      {sorted === "desc" && <ArrowDown className="size-3" />}
    </button>
  );
}
