import type { Metadata } from "next";
import { ProgressionRulesTable } from "@/features/progression-rules/components/progression-rules-table";

export const metadata: Metadata = { title: "Progression Rules — Gym Ledger" };

export default function ProgressionRulesPage() {
  return (
    <div className="flex flex-col gap-0">
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-border bg-zinc-50 px-6">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Progression Rules</h1>
          <p className="text-xs text-muted-foreground">Configure load progression logic</p>
        </div>
      </div>
      <div className="flex-1 px-6 py-5">
        <ProgressionRulesTable />
      </div>
    </div>
  );
}
