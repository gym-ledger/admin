import type { Metadata } from "next";
import { MusclesTable } from "@/features/muscles/components/muscles-table";

export const metadata: Metadata = {
  title: "Muscles — Gym Ledger",
};

export default function MusclesPage() {
  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-zinc-50 px-6">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Muscles</h1>
          <p className="text-xs text-muted-foreground">
            Manage the muscle taxonomy used for exercise targeting
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-5">
        <MusclesTable />
      </div>
    </div>
  );
}
