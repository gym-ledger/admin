import type { Metadata } from "next";
import { ProgramsTable } from "@/features/programs/components/programs-table";

export const metadata: Metadata = { title: "Workout Programs — Gym Ledger" };

export default function ProgramsPage() {
  return (
    <div className="flex flex-col gap-0">
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-border bg-zinc-50 px-6">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Workout Programs</h1>
          <p className="text-xs text-muted-foreground">Build and manage training programs</p>
        </div>
      </div>
      <div className="flex-1 px-6 py-5">
        <ProgramsTable />
      </div>
    </div>
  );
}
