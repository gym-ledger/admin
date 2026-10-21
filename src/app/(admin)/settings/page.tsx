import type { Metadata } from "next";
import { PageHeader } from "@/features/analytics/components/dashboard-parts";
import { AccountSettings } from "@/features/account/components/account-settings";

export const metadata: Metadata = {
  title: "Settings — Gym Ledger",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Settings" description="Your account, password and signed-in devices" />
      <div className="flex-1 px-6 py-5">
        <AccountSettings />
      </div>
    </div>
  );
}
