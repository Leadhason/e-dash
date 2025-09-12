import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, Shield, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { WarrantyWithDetails } from "@/types";
import { useState } from "react";

export default function Warranties() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data: warranties, isLoading } = useQuery<WarrantyWithDetails[]>({
    queryKey: ["/api/warranties", { status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      
      const response = await fetch(`/api/warranties?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch warranties");
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
      claimed: "bg-amber-100 text-amber-800",
      voided: "bg-red-100 text-red-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const iconConfig = {
      active: { Icon: Shield, color: "text-green-600", bg: "bg-green-100" },
      expired: { Icon: Calendar, color: "text-gray-600", bg: "bg-gray-100" },
      claimed: { Icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-100" },
      voided: { Icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
    };
    return iconConfig[status as keyof typeof iconConfig] || { Icon: Shield, color: "text-gray-600", bg: "bg-gray-100" };
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCustomerDisplayName = (customer: WarrantyWithDetails['customer']) => {
    if (!customer) return "Unknown Customer";
    return customer.companyName || `${customer.contactFirstName} ${customer.contactLastName}`;
  };

  const isExpiringSoon = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    return end <= thirtyDaysFromNow && end > now;
  };

  const getDaysRemaining = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Warranties</h1>
            <p className="text-muted-foreground mt-1">
              Manage product warranties and process claims
            </p>
          </div>
          <Button data-testid="register-warranty-button">
            <Plus className="mr-2 h-4 w-4" />
            Register Warranty
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Warranties</p>
                <p className="text-xl font-bold text-foreground">
                  {warranties?.filter(w => w.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-xl font-bold text-foreground">
                  {warranties?.filter(w => w.status === 'active' && isExpiringSoon(w.warrantyEndDate)).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claims Pending</p>
                <p className="text-xl font-bold text-foreground">
                  {warranties?.filter(w => w.status === 'claimed' && !w.resolutionNotes).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claims Resolved</p>
                <p className="text-xl font-bold text-foreground">
                  {warranties?.filter(w => w.status === 'claimed' && w.resolutionNotes).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="voided">Voided</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="filter-button">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warranties Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Warranties</CardTitle>
            <div className="text-sm text-muted-foreground">
              {warranties?.length || 0} warranties
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-4 bg-muted rounded w-32 mb-1"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-40"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : warranties?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warranties.map((warranty) => {
                const { Icon, color, bg } = getStatusIcon(warranty.status);
                const daysRemaining = getDaysRemaining(warranty.warrantyEndDate);
                const expiringSoon = isExpiringSoon(warranty.warrantyEndDate);
                
                return (
                  <div
                    key={warranty.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                    data-testid={`warranty-card-${warranty.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {warranty.product?.name || "Unknown Product"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {warranty.product?.brand} - {warranty.product?.sku}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(warranty.status)}>
                        {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="text-foreground truncate">
                          {getCustomerDisplayName(warranty.customer)}
                        </span>
                      </div>
                      
                      {warranty.serialNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Serial #:</span>
                          <span className="text-foreground font-mono">{warranty.serialNumber}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Purchase Date:</span>
                        <span className="text-foreground">{formatDate(warranty.purchaseDate)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Warranty End:</span>
                        <span className={`text-foreground ${expiringSoon ? 'text-amber-600 font-medium' : ''}`}>
                          {formatDate(warranty.warrantyEndDate)}
                        </span>
                      </div>
                      
                      {warranty.status === 'active' && daysRemaining > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Days Remaining:</span>
                          <span className={`text-foreground ${expiringSoon ? 'text-amber-600 font-medium' : ''}`}>
                            {daysRemaining} days
                          </span>
                        </div>
                      )}
                      
                      {warranty.claimDate && (
                        <div className="pt-2 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Claim Date:</span>
                            <span className="text-foreground">{formatDate(warranty.claimDate)}</span>
                          </div>
                          {warranty.claimReason && (
                            <div className="mt-2">
                              <span className="text-muted-foreground text-xs">Reason:</span>
                              <p className="text-foreground text-xs mt-1">{warranty.claimReason}</p>
                            </div>
                          )}
                          {warranty.resolutionNotes && (
                            <div className="mt-2">
                              <span className="text-muted-foreground text-xs">Resolution:</span>
                              <p className="text-foreground text-xs mt-1">{warranty.resolutionNotes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No warranties found</p>
              {statusFilter && (
                <Button
                  variant="link"
                  onClick={() => setStatusFilter("")}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
