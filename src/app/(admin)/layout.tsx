"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/shared/sidebar";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const status = useAuthStore((s) => s.status);
  const { sidebarCollapsed } = useUiStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [_hasHydrated, status, router]);

  if (!_hasHydrated || status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex min-h-svh bg-zinc-50">
      <Sidebar />
      <main
        className={cn(
          "flex flex-1 flex-col transition-[margin-left] duration-200 ease-in-out",
          sidebarCollapsed ? "ml-14" : "ml-56",
        )}
      >
        {children}
      </main>
    </div>
  );
}
