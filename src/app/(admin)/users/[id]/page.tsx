import type { Metadata } from "next";
import { UserDetail } from "@/features/users/components/user-detail";

export const metadata: Metadata = {
  title: "User — Gym Ledger",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDetail id={id} />;
}
