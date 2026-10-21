import type { Metadata } from "next";
import { PageHeader } from "@/features/analytics/components/dashboard-parts";
import { UsersTable } from "@/features/users/components/users-table";

export const metadata: Metadata = {
  title: "Users — Gym Ledger",
};

export default function UsersPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Users" description="Who signed up and how active they are (read-only)" />
      <div className="flex-1 px-6 py-5">
        <UsersTable />
      </div>
    </div>
  );
}
