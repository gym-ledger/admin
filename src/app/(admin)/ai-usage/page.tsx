import type { Metadata } from "next";
import { PageHeader } from "@/features/analytics/components/dashboard-parts";
import { AiUsageDashboard } from "@/features/analytics/components/ai-usage-dashboard";

export const metadata: Metadata = {
  title: "AI Usage — Gym Ledger",
};

export default function AiUsagePage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="AI usage" description="Groq model calls, tokens, latency and weekly check-in outcomes" />
      <div className="flex-1 px-6 py-5">
        <AiUsageDashboard />
      </div>
    </div>
  );
}
