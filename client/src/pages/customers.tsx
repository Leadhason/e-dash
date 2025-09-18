import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Phone, Mail, CreditCard, User, Building, Landmark, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Customer } from "@shared/schema";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as customerUtils from "@/lib/utils/customer";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const { data: customers, isLoading, error } = useQuery<Customer[]>({
    queryKey: ["customers", { search: searchQuery, type: typeFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      
      const response = await fetch(`/api/customers?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  return (
    <DashboardLayout>
      <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">
              Manage and view all your customer accounts here
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="professional_contractor">Professional Contractor</SelectItem>
                <SelectItem value="industrial_account">Industrial Account</SelectItem>
                <SelectItem value="government_municipal">Government/Municipal</SelectItem>
                <SelectItem value="educational_institution">Educational Institution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-destructive">Error loading customers. Please try again.</p>
                </div>
              ) : !customers?.length ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No customers found.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Credit Limit</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => {
                        const CustomerTypeIcon = customerUtils.getCustomerIcon(customer.customerType);
                        return (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {customer.contactFirstName} {customer.contactLastName}
                                </span>
                                {customer.companyName && (
                                  <span className="text-sm text-muted-foreground">
                                    {customer.companyName}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CustomerTypeIcon className="h-4 w-4" />
                                <Badge variant="secondary" className={customerUtils.getCustomerTypeColor(customer.customerType)}>
                                  {customerUtils.formatCustomerType(customer.customerType)}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{customer.email}</span>
                                </div>
                                {customer.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{customer.phone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {customer.address && typeof customer.address === 'object' && 'city' in customer.address ? (
                                <div className="flex flex-col">
                                  <span className="text-sm">{(customer.address as any).city}</span>
                                  <span className="text-sm text-muted-foreground">{(customer.address as any).state}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not provided</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                {customerUtils.formatCurrency(customer.creditLimit)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={customer.isActive ? "default" : "secondary"}>
                                {customer.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );

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
                <SelectItem value="all">All Customer Types</SelectItem>
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
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
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
