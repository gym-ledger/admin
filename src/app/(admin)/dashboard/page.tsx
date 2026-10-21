import type { Metadata } from "next";
import { PageHeader } from "@/features/analytics/components/dashboard-parts";
import { DashboardHome } from "@/features/analytics/components/dashboard-home";

export const metadata: Metadata = {
  title: "Dashboard — Gym Ledger",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Dashboard" description="This week's activity and what needs attention" />
      <div className="flex-1 px-6 py-5">
        <DashboardHome />
      </div>
    </div>
  );
}
