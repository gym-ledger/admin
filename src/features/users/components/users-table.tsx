"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/types/api";
import { useUsers } from "@/features/users/hooks/use-users";
import type { UserActivityFilter, UserListItem, UserSort } from "@/features/users/types";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelative,
} from "@/features/analytics/utils/format";

const columnHelper = createColumnHelper<UserListItem>();

const ACTIVITY_OPTIONS: { value: UserActivityFilter | "all"; label: string }[] = [
  { value: "all", label: "Any activity" },
  { value: "active_7d", label: "Active in last 7 days" },
  { value: "inactive_30d", label: "Inactive 30+ days" },
];

function YesNo({ value, label }: { value: boolean; label: string }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
      <Check className="size-3.5" aria-hidden />
      Yes
      <span className="sr-only">, {label}</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="size-3.5" aria-hidden />
      No
    </span>
  );
}

function SortHeader({
  label,
  field,
  sort,
  order,
  onSort,
}: {
  label: string;
  field: UserSort;
  sort: UserSort;
  order: "asc" | "desc";
  onSort: (field: UserSort) => void;
}) {
  const active = sort === field;
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        "-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground",
        active && "text-foreground",
      )}
      aria-label={`Sort by ${label}`}
    >
      {label}
      <Icon className="size-3" aria-hidden />
    </button>
  );
}

export function UsersTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<UserSort>("last_active");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [activity, setActivity] = useState<UserActivityFilter | null>(null);
  const [hasPlan, setHasPlan] = useState(false);

  const { data, isLoading, isFetching, isError, error, refetch, isPlaceholderData } = useUsers({
    page,
    limit: 25,
    search: search || undefined,
    sort,
    order,
    activity,
    hasPlan,
  });
  const users = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  function handleSort(field: UserSort) {
    if (field === sort) {
      setOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  }

  const columns = [
    columnHelper.display({
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex min-w-0 flex-col">
            <Link
              href={`/users/${u.id}`}
              className="truncate font-medium text-foreground hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {u.name ?? <span className="italic text-muted-foreground">No name</span>}
            </Link>
            <span className="truncate text-xs text-muted-foreground">
              {[u.email, u.phone].filter(Boolean).join(" · ")}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: () => (
        <SortHeader label="Signed up" field="created_at" sort={sort} order={order} onSort={handleSort} />
      ),
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">{formatDate(getValue())}</span>
      ),
    }),
    columnHelper.accessor("last_active_at", {
      header: () => (
        <SortHeader label="Last active" field="last_active" sort={sort} order={order} onSort={handleSort} />
      ),
      cell: ({ getValue }) => {
        const v = getValue();
        return (
          <span
            className={cn("whitespace-nowrap tabular-nums", v ? "text-foreground" : "text-muted-foreground")}
            title={v ? formatDateTime(v) : undefined}
          >
            {formatRelative(v)}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "workouts",
      header: () => <span title="Completed workouts, last 7 / 30 days">Workouts 7d / 30d</span>,
      cell: ({ row }) => (
        <span className="tabular-nums">
          <span className="text-foreground">{row.original.workouts_7d}</span>
          <span className="text-muted-foreground"> / {row.original.workouts_30d}</span>
        </span>
      ),
    }),
    columnHelper.accessor("weigh_in_days_30d", {
      header: () => <span title="Distinct weigh-in days in the last 30 days">Weigh-ins 30d</span>,
      cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
    }),
    columnHelper.accessor("has_active_plan", {
      header: "Active plan",
      cell: ({ getValue }) => <YesNo value={getValue()} label="has an active plan" />,
    }),
    columnHelper.accessor("has_goal", {
      header: "Goal",
      cell: ({ getValue }) => <YesNo value={getValue()} label="has a weight goal" />,
    }),
    columnHelper.accessor("ai_calls", {
      header: () => <span title="Model calls made for this user (last 12 months)">AI calls</span>,
      cell: ({ getValue }) => <span className="tabular-nums">{formatNumber(getValue())}</span>,
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  const filtered = !!search || !!activity || hasPlan;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput.trim());
            setPage(1);
          }}
          className="relative max-w-xs flex-1"
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search email, phone or name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
            aria-label="Search users"
          />
        </form>
        <Select
          value={activity ?? "all"}
          onValueChange={(v) => {
            setActivity(v === "all" ? null : (v as UserActivityFilter));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48" aria-label="Activity filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
          <Checkbox
            checked={hasPlan}
            onCheckedChange={(v) => {
              setHasPlan(v === true);
              setPage(1);
            }}
          />
          Has active plan
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
        {meta && (
          <span className="ml-auto text-xs tabular-nums text-muted-foreground">
            {formatNumber(meta.totalCount)} user{meta.totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white">
        <div className="max-h-[calc(100svh-11rem)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-zinc-50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-9 whitespace-nowrap px-3 text-left text-xs font-medium text-muted-foreground"
                    >
                      {!header.isPlaceholder &&
                        flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5" colSpan={columns.length}>
                      <Skeleton className="h-8 w-full" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                    Couldn&apos;t load users: {getErrorMessage(error)}{" "}
                    <button type="button" className="font-medium text-indigo-700 hover:underline" onClick={() => refetch()}>
                      Try again
                    </button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-sm text-muted-foreground">
                    {filtered ? "No users match these filters." : "No users have signed up yet."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/users/${row.original.id}`)}
                    className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="max-w-72 px-3 py-2.5">
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
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages || isFetching}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
