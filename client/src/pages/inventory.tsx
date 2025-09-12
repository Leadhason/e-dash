import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Warehouse, AlertTriangle, Package, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Inventory } from "@shared/schema";
import { useState } from "react";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory", { search: searchQuery, location: locationFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (locationFilter && locationFilter !== "all") params.append("location", locationFilter);
      
      const response = await fetch(`/api/inventory?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch inventory");
      return response.json();
    },
  });

  // Calculate summary metrics
  const totalItems = inventory?.length || 0;
  const lowStockItems = inventory?.filter(item => item.quantityAvailable <= 10).length || 0;
  const outOfStockItems = inventory?.filter(item => item.quantityAvailable === 0).length || 0;
  // Since inventory doesn't have cost data, we'll use a placeholder
  const totalValue = 0; // Can be calculated when product cost data is available

  const getStockStatusBadge = (available: number, reorderPoint?: number | null) => {
    if (available === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
    }
    if (reorderPoint && available <= reorderPoint) {
      return <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>;
    }
    if (available <= 10) {
      return <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Warehouse className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground mt-1">
                Track stock levels and manage inventory across locations
              </p>
            </div>
          </div>
          <Button data-testid="add-inventory-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground mt-2">{totalItems}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600 mt-2">{lowStockItems}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{outOfStockItems}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by product SKU, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="inventory-search-input"
                />
              </div>
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48" data-testid="location-filter">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="main_warehouse">Main Warehouse</SelectItem>
                <SelectItem value="retail_store">Retail Store</SelectItem>
                <SelectItem value="distribution_center">Distribution Center</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="filter-button">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <div className="text-sm text-muted-foreground">
              {inventory?.length || 0} items
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : inventory && inventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Available</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Reserved</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Last Check</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Max Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          Product ID: {item.productId}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Warehouse className="h-4 w-4 text-muted-foreground" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{item.quantityAvailable}</span>
                      </td>
                      <td className="p-4">
                        <span>{item.quantityReserved || 0}</span>
                      </td>
                      <td className="p-4">
                        {getStockStatusBadge(item.quantityAvailable, item.reorderPoint)}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {item.lastStockCheck 
                            ? new Date(item.lastStockCheck).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        <span>{item.maxStock || 'No limit'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No inventory items found</p>
              <p className="text-muted-foreground">
                Start by adding inventory items to track your stock levels.
              </p>
              <Button className="mt-4" data-testid="add-first-inventory-button">
                <Plus className="mr-2 h-4 w-4" />
                Add First Inventory Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}