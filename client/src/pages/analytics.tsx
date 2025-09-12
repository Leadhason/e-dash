import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { BarChart3, TrendingUp, Users, Package, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";

interface DashboardMetrics {
  monthlyRevenue: number;
  activeOrders: number;
  lowStockItems: number;
  warrantyClaimsCount: number;
}

export default function Analytics() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/metrics", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const metricCards = [
    {
      title: "Monthly Revenue",
      value: isLoading ? "..." : formatCurrency(metrics?.monthlyRevenue || 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Active Orders",
      value: isLoading ? "..." : (metrics?.activeOrders || 0).toString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Low Stock Items",
      value: isLoading ? "..." : (metrics?.lowStockItems || 0).toString(),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Warranty Claims",
      value: isLoading ? "..." : (metrics?.warrantyClaimsCount || 0).toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Overview</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive business analytics and insights
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bg}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Power Tools", percentage: 35, value: "35%" },
                { name: "Hand Tools", percentage: 28, value: "28%" },
                { name: "Safety Equipment", percentage: 20, value: "20%" },
                { name: "Accessories", percentage: 12, value: "12%" },
                { name: "Replacement Parts", percentage: 5, value: "5%" },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{category.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "New order received",
                  description: "Order #ORD-2024-001 from Acme Construction",
                  time: "2 minutes ago",
                  color: "bg-green-100 text-green-800",
                },
                {
                  action: "Low stock alert",
                  description: "DeWalt DCD771C2 drill below threshold",
                  time: "15 minutes ago",
                  color: "bg-amber-100 text-amber-800",
                },
                {
                  action: "Warranty claimed",
                  description: "Claim submitted for Makita XSS02Z saw",
                  time: "1 hour ago",
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  action: "New customer registered",
                  description: "Professional contractor account created",
                  time: "2 hours ago",
                  color: "bg-purple-100 text-purple-800",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${activity.color}`}>
                      •
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}