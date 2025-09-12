import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Building, Mail, Phone, MapPin, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Vendor } from "@shared/schema";
import { useState } from "react";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
    queryFn: async () => {
      const response = await fetch("/api/vendors", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch vendors");
      return response.json();
    },
  });

  const filteredVendors = vendors?.filter(vendor => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(searchLower) ||
      vendor.contactEmail?.toLowerCase().includes(searchLower)
    );
  });

  const formatAddress = (address: any) => {
    if (!address) return "No address provided";
    
    if (typeof address === 'string') return address;
    
    // Assuming address is an object with properties like street, city, state, zip
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zip) parts.push(address.zip);
    
    return parts.length > 0 ? parts.join(', ') : "No address provided";
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
            <p className="text-muted-foreground mt-1">
              Manage supplier relationships and partnerships
            </p>
          </div>
          <Button data-testid="add-vendor-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-xl font-bold text-foreground">
                  {vendors?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Authorized Dealers</p>
                <p className="text-xl font-bold text-foreground">
                  {vendors?.filter(v => v.isAuthorizedDealer).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Vendors</p>
                <p className="text-xl font-bold text-foreground">
                  {vendors?.filter(v => v.isActive).length || 0}
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vendors by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="vendor-search-input"
                />
              </div>
            </div>
            <Button variant="outline" data-testid="filter-button">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Vendors</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredVendors?.length || 0} vendors
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-12 w-12 bg-muted rounded-lg"></div>
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
          ) : filteredVendors?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                  data-testid={`vendor-card-${vendor.id}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{vendor.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {vendor.isAuthorizedDealer && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Authorized Dealer
                          </Badge>
                        )}
                        <Badge 
                          variant={vendor.isActive ? "default" : "secondary"}
                          className={`text-xs ${vendor.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {vendor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    {vendor.contactEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground truncate">{vendor.contactEmail}</span>
                      </div>
                    )}
                    
                    {vendor.contactPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{vendor.contactPhone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-xs leading-relaxed">
                        {formatAddress(vendor.address)}
                      </span>
                    </div>
                    
                    {vendor.paymentTerms && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Payment Terms:</span>
                          <span className="text-foreground font-medium">
                            Net {vendor.paymentTerms} days
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Added: {new Date(vendor.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(vendor.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vendors found</p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
