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
  Trash2, Plus, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const DUMMY_RULES: ProgressionRule[] = [
  {
    id: "1", name: "Linear Double Progression", type: "double_progression",
    config: { min_reps: 8, max_reps: 12, load_increment: 2.5 },
    deleted_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "2", name: "RIR Wave 3-2-1", type: "rir_cycling",
    config: { week_1_rir: 3, week_2_rir: 2, week_3_rir: 1, deload_rir: 4 },
    deleted_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: "3", name: "5% Weekly Load Increase", type: "percentage_based",
    config: { increment_percent: 5, apply_every_n_sessions: 1 },
    deleted_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

export function ProgressionRulesTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRule, setEditRule] = useState<ProgressionRule | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRule, setDeleteRule] = useState<ProgressionRule | null>(null);
  const [rules, setRules] = useState<ProgressionRule[]>(DUMMY_RULES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  function openCreate() { setEditRule(null); setDrawerOpen(true); }
  function openEdit(r: ProgressionRule) { setEditRule(r); setDrawerOpen(true); }
  function openDelete(r: ProgressionRule) { setDeleteRule(r); setDeleteOpen(true); }

  function handleSave(data: Omit<ProgressionRule, "id" | "deleted_at" | "created_at" | "updated_at">) {
    if (editRule) {
      setRules((prev) => prev.map((r) => r.id === editRule.id ? { ...r, ...data, updated_at: new Date().toISOString() } : r));
    } else {
      setRules((prev) => [...prev, {
        ...data, id: crypto.randomUUID(),
        deleted_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }]);
    }
    setDrawerOpen(false);
  }

  function handleDelete() {
    if (deleteRule) {
      setRules((prev) => prev.filter((r) => r.id !== deleteRule.id));
    }
    setDeleteOpen(false);
  }

  function handleRefresh() {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
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
          <span className={cn("inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium", TYPE_COLORS[t] ?? "bg-muted text-muted-foreground")}>
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
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDelete(row.original)}>
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
  });

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh">
          <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
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
              {isRefreshing ? (
                Array.from({ length: 3 }).map((_, i) => (
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
      </div>

      <ProgressionRuleFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        rule={editRule}
        onSave={handleSave}
      />
      <DeleteProgressionRuleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        rule={deleteRule}
        onConfirm={handleDelete}
      />
    </>
  );
}

function SortHeader({ label, sorted, onClick }: { label: string; sorted: false | "asc" | "desc"; onClick?: (e: unknown) => void }) {
  return (
    <button className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground" onClick={onClick}>
      {label}
      {sorted === false && <ArrowUpDown className="size-3" />}
      {sorted === "asc" && <ArrowUp className="size-3" />}
      {sorted === "desc" && <ArrowDown className="size-3" />}
    </button>
  );
}
