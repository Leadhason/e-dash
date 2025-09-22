import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, AlertTriangle, Shield } from "lucide-react";
import { DashboardMetrics } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface MetricsGridProps {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}

export function MetricsGrid({ metrics, isLoading }: MetricsGridProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 md:p-6">
              <div className="animate-pulse">
                <div className="h-3 md:h-4 bg-muted rounded w-16 md:w-24 mb-2"></div>
                <div className="h-6 md:h-8 bg-muted rounded w-12 md:w-20 mb-2 md:mb-4"></div>
                <div className="h-3 md:h-4 bg-muted rounded w-12 md:w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (isMobile && amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (isMobile && amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (isMobile && num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const metricsData = [
    {
      title: isMobile ? "Revenue" : "Monthly Revenue",
      value: formatCurrency(metrics?.monthlyRevenue || 0),
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "↗ 12.5%",
      changeColor: "text-green-600",
      changeText: isMobile ? "vs last mo." : "vs last month",
      testId: "revenue-metric"
    },
    {
      title: isMobile ? "Orders" : "Active Orders",
      value: formatNumber(metrics?.activeOrders || 0),
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "↗ 8.2%",
      changeColor: "text-blue-600",
      changeText: isMobile ? "vs last mo." : "vs last month",
      testId: "orders-metric"
    },
    {
      title: isMobile ? "Low Stock" : "Low Stock Items",
      value: formatNumber(metrics?.lowStockItems || 0),
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      change: "↑ 15.3%",
      changeColor: "text-amber-600",
      changeText: isMobile ? "attention" : "needs attention",
      testId: "lowstock-metric"
    },
    {
      title: isMobile ? "Warranties" : "Warranty Claims",
      value: formatNumber(metrics?.warrantyClaimsCount || 0),
      icon: Shield,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      change: "↓ 5.1%",
      changeColor: "text-green-600",
      changeText: isMobile ? "vs last mo." : "vs last month",
      testId: "warranty-metric"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        
        return (
          <Card key={metric.title} data-testid={metric.testId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 md:p-6">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{metric.title}</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground mt-1 truncate">{metric.value}</p>
                </div>
                <div className={`w-8 h-8 md:w-12 md:h-12 ${metric.iconBg} rounded-full flex items-center justify-center flex-shrink-0 ml-2`}>
                  <Icon className={`h-4 w-4 md:h-6 md:w-6 ${metric.iconColor}`} />
                </div>
              </div>
              <div className="mt-2 md:mt-4 flex items-center min-w-0">
                <span className={`text-xs md:text-sm font-medium ${metric.changeColor} flex-shrink-0`}>{metric.change}</span>
                <span className="text-muted-foreground text-xs md:text-sm ml-1 md:ml-2 truncate">{metric.changeText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
