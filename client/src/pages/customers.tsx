import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Building, User, GraduationCap, Landmark } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Customer } from "@shared/schema";
import { useState } from "react";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers", { search: searchQuery, type: typeFilter }],
    queryFn: async () => {
      const response = await fetch("/api/customers", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const getCustomerTypeIcon = (type: string) => {
    const iconConfig = {
      individual: { Icon: User, color: "text-blue-600", bg: "bg-blue-100" },
      professional_contractor: { Icon: Building, color: "text-green-600", bg: "bg-green-100" },
      industrial_account: { Icon: Building, color: "text-purple-600", bg: "bg-purple-100" },
      government_municipal: { Icon: Landmark, color: "text-amber-600", bg: "bg-amber-100" },
      educational_institution: { Icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-100" },
    };
    return iconConfig[type as keyof typeof iconConfig] || { Icon: User, color: "text-gray-600", bg: "bg-gray-100" };
  };

  const getCustomerTypeColor = (type: string) => {
    const colors = {
      individual: "bg-blue-100 text-blue-800",
      professional_contractor: "bg-green-100 text-green-800",
      industrial_account: "bg-purple-100 text-purple-800",
      government_municipal: "bg-amber-100 text-amber-800",
      educational_institution: "bg-indigo-100 text-indigo-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatCustomerType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCustomerDisplayName = (customer: Customer) => {
    return customer.companyName || `${customer.contactFirstName} ${customer.contactLastName}`;
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = !searchQuery || 
      getCustomerDisplayName(customer).toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || customer.customerType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer accounts and relationships
            </p>
          </div>
          <Button data-testid="add-customer-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
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
                  placeholder="Search customers by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="customer-search-input"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-56" data-testid="customer-type-filter">
                <SelectValue placeholder="All Customer Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Customer Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="professional_contractor">Professional Contractor</SelectItem>
                <SelectItem value="industrial_account">Industrial Account</SelectItem>
                <SelectItem value="government_municipal">Government/Municipal</SelectItem>
                <SelectItem value="educational_institution">Educational Institution</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="filter-button">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Customers</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredCustomers?.length || 0} customers
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
          ) : filteredCustomers?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => {
                const { Icon, color, bg } = getCustomerTypeIcon(customer.customerType);
                
                return (
                  <div
                    key={customer.id}
                    className="border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                    data-testid={`customer-card-${customer.id}`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {getCustomerDisplayName(customer)}
                        </h3>
                        <Badge variant="secondary" className={`${getCustomerTypeColor(customer.customerType)} text-xs`}>
                          {formatCustomerType(customer.customerType)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Contact:</span>
                        <span className="text-foreground">{customer.contactFirstName} {customer.contactLastName}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground truncate">{customer.email}</span>
                      </div>
                      
                      {customer.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="text-foreground">{customer.phone}</span>
                        </div>
                      )}
                      
                      {customer.creditLimit && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Credit Limit:</span>
                          <span className="text-foreground font-medium">
                            {formatCurrency(customer.creditLimit)}
                          </span>
                        </div>
                      )}
                      
                      {customer.paymentTerms && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Payment Terms:</span>
                          <span className="text-foreground">Net {customer.paymentTerms} days</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          {customer.taxExempt && (
                            <Badge variant="outline" className="text-xs">Tax Exempt</Badge>
                          )}
                          <Badge 
                            variant={customer.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No customers found</p>
              {(searchQuery || typeFilter) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("");
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
