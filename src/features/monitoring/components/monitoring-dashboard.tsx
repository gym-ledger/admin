"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/types/api";
import { ErrorState } from "@/features/analytics/components/dashboard-parts";
import { IssuesTab } from "@/features/monitoring/components/issues-tab";
import { PerformanceTab } from "@/features/monitoring/components/performance-tab";
import { useMonitoringStatus } from "@/features/monitoring/hooks/use-monitoring";

/** API page: Prometheus performance on one tab, the Postgres error/slow log on the other. */
export function MonitoringDashboard() {
  const status = useMonitoringStatus();
  const [tab, setTab] = useState("performance");
  const [route, setRoute] = useState<string>();

  if (status.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (status.isError || !status.data) {
    return <ErrorState message={getErrorMessage(status.error)} onRetry={() => status.refetch()} />;
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-4">
      <div className="flex items-center justify-between gap-2 border-b border-border">
        <TabsList variant="line">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="issues">Errors &amp; slow requests</TabsTrigger>
        </TabsList>
        {status.data.grafanaUrl && (
          <a
            href={status.data.grafanaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 pb-1 text-xs font-medium text-indigo-700 hover:underline"
          >
            Open Grafana <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <TabsContent value="performance">
        <PerformanceTab
          status={status.data}
          onSelectRoute={(r) => {
            setRoute(r);
            setTab("issues");
          }}
        />
      </TabsContent>
      <TabsContent value="issues">
        <IssuesTab status={status.data} route={route} onRouteChange={setRoute} />
      </TabsContent>
    </Tabs>
  );
}
