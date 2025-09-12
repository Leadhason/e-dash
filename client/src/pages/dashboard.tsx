import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CategoryPerformance } from "@/components/dashboard/category-performance";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SystemAlerts } from "@/components/dashboard/system-alerts";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { DashboardMetrics } from "@/types";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/metrics", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard metrics");
      return response.json();
    },
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your tools and power technologies e-commerce operations
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" data-testid="export-report-button">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button data-testid="quick-action-button">
              <Plus className="mr-2 h-4 w-4" />
              Quick Action
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="mb-8">
        <MetricsGrid metrics={metrics} isLoading={metricsLoading} />
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart />
        <CategoryPerformance />
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentOrders />
        <SystemAlerts />
      </div>

      {/* Quick Actions Section */}
      <QuickActions />
    </DashboardLayout>
  );
}
