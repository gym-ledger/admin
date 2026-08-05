"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  Zap,
  HeartPulse,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMuscles,
  useMusclesDropdown,
  useImportMuscles,
  useExportMuscles,
} from "@/features/muscles/hooks/use-muscles";
import { MuscleFormDrawer } from "@/features/muscles/components/muscle-form-drawer";
import { DeleteMuscleDialog } from "@/features/muscles/components/delete-muscle-dialog";
import type { Muscle } from "@/features/muscles/types";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Muscle>();

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MusclesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [parentsOnly, setParentsOnly] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMuscle, setEditMuscle] = useState<Muscle | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMuscle, setDeleteMuscle] = useState<Muscle | null>(null);

  const importFileRef = useRef<HTMLInputElement>(null);
  const { mutate: runImport, isPending: isImporting } = useImportMuscles();
  const { mutate: runExport, isPending: isExporting } = useExportMuscles();

  // Server returns rows pre-ordered as parent, its children, next parent, ...
  const { data, isLoading, isFetching, refetch } = useMuscles({
    page,
    limit: 20,
    search: search || undefined,
    parentsOnly,
  });

  const muscles = data?.data ?? [];
  const meta = data?.meta;

  // Flat lookup of all muscle names, used to render the "Parent" column.
  const { data: allMuscles } = useMusclesDropdown({ limit: 500 });
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of allMuscles?.data ?? []) map.set(m.id, m.name);
    return map;
  }, [allMuscles]);

  function openCreate() {
    setEditMuscle(null);
    setDrawerOpen(true);
  }

  function openEdit(muscle: Muscle) {
    setEditMuscle(muscle);
    setDrawerOpen(true);
  }

  function openDelete(muscle: Muscle) {
    setDeleteMuscle(muscle);
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

  function toggleParentsOnly(checked: boolean) {
    setParentsOnly(checked);
    setPage(1);
  }

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {m.parent_muscle_id && (
                <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">{m.name}</span>
            </div>
            <code className="text-xs text-muted-foreground">{m.slug}</code>
          </div>
        );
      },
    }),
    columnHelper.accessor("parent_muscle_id", {
      header: "Parent",
      cell: ({ getValue }) => {
        const parentId = getValue();
        if (!parentId) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <span className="text-sm text-foreground">
            {nameById.get(parentId) ?? "—"}
          </span>
        );
      },
    }),
    columnHelper.accessor("body_region", {
      header: "Body region",
      cell: ({ getValue }) => {
        const region = getValue();
        return region ? (
          <Badge variant="secondary" className="font-normal">
            {region}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.display({
      id: "flags",
      header: "Flags",
      cell: ({ row }) => {
        const m = row.original;
        if (!m.xp_enabled && !m.recovery_enabled) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        return (
          <div className="flex items-center gap-1">
            {m.xp_enabled && (
              <Badge variant="outline" className="gap-1 font-normal">
                <Zap className="size-3" />
                XP
              </Badge>
            )}
            {m.recovery_enabled && (
              <Badge variant="outline" className="gap-1 font-normal">
                <HeartPulse className="size-3" />
                Recovery
              </Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("display_order", {
      header: "Order",
      cell: ({ getValue }) => (
        <span className="tabular-nums text-muted-foreground">{getValue()}</span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created",
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
    data: muscles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search muscles…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </form>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
          <Checkbox
            checked={parentsOnly}
            onCheckedChange={(v) => toggleParentsOnly(v === true)}
          />
          Only show parent muscles
        </label>
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
            New muscle
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
              ) : muscles.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-sm text-muted-foreground"
                  >
                    {search
                      ? `No muscles found for "${search}".`
                      : "No muscles yet. Create your first one."}
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
              {meta.totalCount} muscles &middot; page {meta.page} of{" "}
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

      <MuscleFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        muscle={editMuscle}
      />
      <DeleteMuscleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        muscle={deleteMuscle}
      />
    </>
  );
}
