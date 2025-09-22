import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CategoryPerformance } from "@/components/dashboard/category-performance";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { SystemAlerts } from "@/components/dashboard/system-alerts";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Button } from "@/components/ui/button";
import { Download, Plus, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { DashboardMetrics } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const isMobile = useIsMobile();
  
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
      {/* Page Header - Mobile Responsive */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
              Dashboard Overview
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {isMobile 
                ? "Monitor your e-commerce operations" 
                : "Monitor your tools and power technologies e-commerce operations"
              }
            </p>
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex items-center justify-end space-x-2 md:space-x-3">
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem data-testid="export-report-button">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="quick-action-button">
                    <Plus className="mr-2 h-4 w-4" />
                    Quick Action
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" data-testid="export-report-button">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button data-testid="quick-action-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Quick Action
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards - Responsive Grid */}
      <div className="mb-6 md:mb-8">
        <MetricsGrid metrics={metrics} isLoading={metricsLoading} />
      </div>

      {/* Charts Section - Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="order-1">
          <SalesChart />
        </div>
        <div className="order-2">
          <CategoryPerformance />
        </div>
      </div>

      {/* Activity and Alerts - Mobile Stack, Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className={`order-1 ${isMobile ? 'col-span-1' : 'lg:col-span-1 xl:col-span-2'}`}>
          <RecentOrders />
        </div>
        <div className="order-2">
          <SystemAlerts />
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="order-last">
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
