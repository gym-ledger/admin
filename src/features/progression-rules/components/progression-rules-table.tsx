"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Pencil,
  Trash2, Plus, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useProgressionRules,
  useCreateProgressionRule,
  useUpdateProgressionRule,
  useDeleteProgressionRule,
} from "@/features/progression-rules/hooks/use-progression-rules";
import { ProgressionRuleFormDrawer } from "./progression-rule-form-drawer";
import { DeleteProgressionRuleDialog } from "./delete-progression-rule-dialog";
import type { ProgressionRule } from "@/features/progression-rules/types";
import { PROGRESSION_RULE_TYPE_LABELS } from "@/features/progression-rules/types";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<ProgressionRule>();

const TYPE_COLORS: Record<string, string> = {
  double_progression: "bg-blue-50 text-blue-700 border-blue-200",
  static_load: "bg-slate-50 text-slate-600 border-slate-200",
  rir_based: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rir_cycling: "bg-teal-50 text-teal-700 border-teal-200",
  percentage_based: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function ProgressionRulesTable() {
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRule, setEditRule] = useState<ProgressionRule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRule, setDeleteRule] = useState<ProgressionRule | null>(null);

  const { data, isLoading, isFetching, refetch } = useProgressionRules({ page, limit: 20 });
  const createMutation = useCreateProgressionRule();
  const updateMutation = useUpdateProgressionRule();
  const deleteMutation = useDeleteProgressionRule();

  const rules = data?.data ?? [];
  const meta = data?.meta;

  function openCreate() { setEditRule(null); setDrawerOpen(true); }
  function openEdit(r: ProgressionRule) { setEditRule(r); setDrawerOpen(true); }
  function openDelete(r: ProgressionRule) { setDeleteRule(r); setDeleteOpen(true); }

  async function handleSave(payload: { name: string; type: ProgressionRule["type"]; config: Record<string, unknown> }) {
    if (editRule) {
      await updateMutation.mutateAsync({ id: editRule.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDrawerOpen(false);
  }

  async function handleDelete() {
    if (deleteRule) await deleteMutation.mutateAsync(deleteRule.id);
    setDeleteOpen(false);
  }

  const columns = [
    columnHelper.accessor("name", {
      header: ({ column }) => (
        <SortHeader label="Name" sorted={column.getIsSorted()} onClick={column.getToggleSortingHandler()} />
      ),
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground">{getValue()}</span>
      ),
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ getValue }) => {
        const t = getValue();
        return (
          <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium", TYPE_COLORS[t] ?? "bg-muted text-muted-foreground border-border")}>
            {PROGRESSION_RULE_TYPE_LABELS[t]}
          </span>
        );
      },
    }),
    columnHelper.accessor("config", {
      header: "Config",
      cell: ({ getValue }) => (
        <code className="line-clamp-1 max-w-xs rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {JSON.stringify(getValue())}
        </code>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: ({ column }) => (
        <SortHeader label="Created" sorted={column.getIsSorted()} onClick={column.getToggleSortingHandler()} />
      ),
      cell: ({ getValue }) => (
        <span className="tabular-nums text-muted-foreground">{formatDate(getValue())}</span>
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
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => openDelete(row.original)}
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: rules,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
        </Button>
        <div className="ml-auto">
          <Button onClick={openCreate} size="sm">
            <Plus className="size-4" /> New rule
          </Button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-muted/40">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="h-9 px-3 text-left text-xs font-medium text-muted-foreground">
                      {!h.isPlaceholder && flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5" colSpan={columns.length}>
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                    No progression rules yet. Create your first one.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {meta.totalCount} rules · page {meta.page} of {meta.totalPages}
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
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || isFetching}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProgressionRuleFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        rule={editRule}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
      <DeleteProgressionRuleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        rule={deleteRule}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}

function SortHeader({ label, sorted, onClick }: {
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
