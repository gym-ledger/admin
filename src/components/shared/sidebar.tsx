"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/programs", label: "Programs", icon: Layers },
  { href: "/progression-rules", label: "Progression Rules", icon: TrendingUp },
  { href: "/users", label: "Users", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { admin, clearAuth } = useAuthStore();
  const { sidebarCollapsed: collapsed, setSidebarCollapsed } = useUiStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-in-out",
          collapsed ? "w-14" : "w-56",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center border-b border-border px-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
              <Dumbbell className="size-4 text-white" />
            </div>
            {!collapsed && (
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                GymAdmin
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            const item = (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-8 items-center gap-2.5 rounded-md px-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>{item}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return item;
          })}
        </nav>

        {/* User + collapse */}
        <div className="shrink-0 border-t border-border p-2">
          {!collapsed && admin && (
            <div className="mb-1 flex items-center gap-2 rounded-md px-2 py-1.5">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                {admin.email[0].toUpperCase()}
              </div>
              <span className="truncate text-xs text-muted-foreground">
                {admin.email}
              </span>
            </div>
          )}
          <div className={cn("flex gap-1", collapsed ? "flex-col" : "flex-row")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={() => clearAuth()}
                >
                  <LogOut className="size-3.5" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>
                Sign out
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto text-muted-foreground"
                  onClick={() => setSidebarCollapsed(!collapsed)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? (
                    <ChevronRight className="size-3.5" />
                  ) : (
                    <ChevronLeft className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"}>
                {collapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
