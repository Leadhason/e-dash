import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Product } from "@shared/schema";
import { useState } from "react";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { search: searchQuery, category: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
      
      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      power_tools: "bg-blue-100 text-blue-800",
      hand_tools: "bg-green-100 text-green-800", 
      safety_equipment: "bg-amber-100 text-amber-800",
      accessories: "bg-purple-100 text-purple-800",
      replacement_parts: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Catalog</h1>
            <p className="text-muted-foreground mt-1">
              Manage your tools and equipment inventory
            </p>
          </div>
          <Button data-testid="add-product-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products by name, SKU, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="product-search-input"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="power_tools">Power Tools</SelectItem>
                <SelectItem value="hand_tools">Hand Tools</SelectItem>
                <SelectItem value="safety_equipment">Safety Equipment</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="replacement_parts">Replacement Parts</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="filter-button">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <div className="text-sm text-muted-foreground">
              {products?.length || 0} products
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-32 mb-3"></div>
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : products?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                  data-testid={`product-card-${product.sku}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className={getCategoryColor(product.category)}>
                      {formatCategory(product.category)}
                    </Badge>
                    {product.isSeasonal && (
                      <Badge variant="outline">Seasonal</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-foreground">
                      ${parseFloat(product.price).toLocaleString()}
                    </span>
                    {product.warrantyMonths && (
                      <span className="text-xs text-muted-foreground">
                        {product.warrantyMonths}mo warranty
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found</p>
              {(searchQuery || categoryFilter) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("");
                  }}
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
