import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, AlertTriangle, Shield } from "lucide-react";
import { DashboardMetrics } from "@/types";

interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-20 mb-4"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const metricsData = [
    {
      title: "Monthly Revenue",
      value: formatCurrency(metrics?.monthlyRevenue || 0),
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "↗ 12.5%",
      changeColor: "text-green-600",
      changeText: "vs last month",
      testId: "revenue-metric"
    },
    {
      title: "Active Orders",
      value: metrics?.activeOrders?.toString() || "0",
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "↗ 8.2%",
      changeColor: "text-blue-600",
      changeText: "vs last month",
      testId: "orders-metric"
    },
    {
      title: "Low Stock Items",
      value: metrics?.lowStockItems?.toString() || "0",
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      change: "↑ 15.3%",
      changeColor: "text-amber-600",
      changeText: "needs attention",
      testId: "lowstock-metric"
    },
    {
      title: "Warranty Claims",
      value: metrics?.warrantyClaimsCount?.toString() || "0",
      icon: Shield,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      change: "↓ 5.1%",
      changeColor: "text-green-600",
      changeText: "vs last month",
      testId: "warranty-metric"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        
        return (
          <Card key={metric.title} data-testid={metric.testId}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 ${metric.iconBg} rounded-full flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${metric.changeColor}`}>{metric.change}</span>
                <span className="text-muted-foreground text-sm ml-2">{metric.changeText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
