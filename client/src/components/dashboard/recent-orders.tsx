import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { OrderWithCustomer } from "@/types";

export function RecentOrders() {
  const { data: orders, isLoading } = useQuery<OrderWithCustomer[]>({
    queryKey: ["/api/dashboard/recent-orders"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/recent-orders", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch recent orders");
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-green-100 text-green-800",
      shipped: "bg-amber-100 text-amber-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getOrderTypeColor = (orderType: string) => {
    const typeColors = {
      retail: "bg-gray-100 text-gray-800",
      bulk: "bg-blue-100 text-blue-800",
      emergency: "bg-red-100 text-red-800",
      warranty: "bg-purple-100 text-purple-800",
      recurring: "bg-green-100 text-green-800",
    };
    return typeColors[orderType as keyof typeof typeColors] || "bg-gray-100 text-gray-800";
  };

  const formatOrderType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatCustomerType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getCustomerDisplayName = (customer: OrderWithCustomer['customer']) => {
    if (!customer) return "Unknown Customer";
    return customer.companyName || `${customer.contactFirstName} ${customer.contactLastName}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <Card className="lg:col-span-2" data-testid="recent-orders">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" data-testid="view-all-orders">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders?.length ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50" data-testid={`order-row-${order.orderNumber}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">#{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">{formatTimeAgo(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{getCustomerDisplayName(order.customer)}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.customer && formatCustomerType(order.customer.customerType)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className={getOrderTypeColor(order.orderType)}>
                          {formatOrderType(order.orderType)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        ${parseFloat(order.totalAmount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
