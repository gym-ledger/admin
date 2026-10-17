import type { Metadata } from "next";
import { PageHeader } from "@/features/analytics/components/dashboard-parts";
import { OverviewDashboard } from "@/features/analytics/components/overview-dashboard";

export const metadata: Metadata = {
  title: "Analytics — GymAdmin",
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Analytics" description="Users, sign-ups and activity across the app" />
      <div className="flex-1 px-6 py-5">
        <OverviewDashboard />
      </div>
    </div>
  );
}
