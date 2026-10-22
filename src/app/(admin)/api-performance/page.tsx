import type { Metadata } from "next";
import { PageHeader } from "@/features/analytics/components/dashboard-parts";
import { MonitoringDashboard } from "@/features/monitoring/components/monitoring-dashboard";

export const metadata: Metadata = {
  title: "API Performance — Gym Ledger",
};

export default function ApiPerformancePage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="API performance" description="Latency percentiles, error rates and the log of failed and slow requests" />
      <div className="flex-1 px-6 py-5">
        <MonitoringDashboard />
      </div>
    </div>
  );
}
