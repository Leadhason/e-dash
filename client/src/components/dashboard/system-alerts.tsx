import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield, Info, CheckCircle } from "lucide-react";
import { SystemAlert } from "@/types";

// Sample alerts data - in a real app this would come from props or API
const alertsData: SystemAlert[] = [
  {
    id: "1",
    type: "critical",
    title: "Critical Stock Level",
    message: "DeWalt 20V Drill - Only 3 units left",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
  {
    id: "2",
    type: "warning",
    title: "Warranty Claim Pending",
    message: "Milwaukee M18 Saw requires review",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "3",
    type: "info",
    title: "Vendor Price Update",
    message: "Makita updated 45 product prices",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
  {
    id: "4",
    type: "success",
    title: "Safety Compliance Updated",
    message: "All PPE items certified for Q1 2024",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export function SystemAlerts() {
  const getAlertIcon = (type: SystemAlert['type']) => {
    const iconConfig = {
      critical: { Icon: AlertCircle, bgColor: "bg-red-100", iconColor: "text-red-600" },
      warning: { Icon: Shield, bgColor: "bg-amber-100", iconColor: "text-amber-600" },
      info: { Icon: Info, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
      success: { Icon: CheckCircle, bgColor: "bg-green-100", iconColor: "text-green-600" },
    };
    return iconConfig[type];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card data-testid="system-alerts">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground">System Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {alertsData.map((alert) => {
            const { Icon, bgColor, iconColor } = getAlertIcon(alert.type);
            
            return (
              <div key={alert.id} className="flex items-start space-x-3" data-testid={`alert-${alert.type}-${alert.id}`}>
                <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(alert.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button 
            variant="ghost" 
            className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2"
            data-testid="view-all-alerts"
          >
            View all alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
