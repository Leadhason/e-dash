import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Tags, Package, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

// For now, using static data - this can be connected to backend later
const staticCategories = [
  {
    id: "power_tools",
    name: "Power Tools",
    description: "Electric and battery-powered tools",
    productCount: 156,
    status: "active",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "hand_tools", 
    name: "Hand Tools",
    description: "Manual tools and instruments",
    productCount: 89,
    status: "active", 
    color: "bg-green-100 text-green-800",
  },
  {
    id: "safety_equipment",
    name: "Safety Equipment", 
    description: "Personal protective equipment",
    productCount: 67,
    status: "active",
    color: "bg-amber-100 text-amber-800",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Tool accessories and attachments",
    productCount: 234,
    status: "active",
    color: "bg-purple-100 text-purple-800", 
  },
  {
    id: "replacement_parts",
    name: "Replacement Parts",
    description: "Spare parts and components",
    productCount: 178,
    status: "active",
    color: "bg-gray-100 text-gray-800",
  },
];

export default function Categories() {
  const [categories] = useState(staticCategories);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Tags className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Product Categories</h1>
              <p className="text-muted-foreground mt-1">
                Organize your product catalog by categories
              </p>
            </div>
          </div>
          <Button data-testid="add-category-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Categories
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Tags className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Package className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Categories
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {categories.filter(cat => cat.status === 'active').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Tags className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Categories</CardTitle>
            <div className="text-sm text-muted-foreground">
              {categories.length} categories
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Products</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Tags className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {category.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-foreground">{category.description}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{category.productCount}</span>
                        <span className="text-muted-foreground text-sm">products</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={category.color}>
                        {category.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`edit-category-${category.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`delete-category-${category.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Statistics */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);
                const percentage = Math.round((category.productCount / totalProducts) * 100);
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color.includes('blue') ? 'bg-blue-500' : category.color.includes('green') ? 'bg-green-500' : category.color.includes('amber') ? 'bg-amber-500' : category.color.includes('purple') ? 'bg-purple-500' : 'bg-gray-500'}`} />
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground">({category.productCount} products)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color.includes('blue') ? 'bg-blue-500' : category.color.includes('green') ? 'bg-green-500' : category.color.includes('amber') ? 'bg-amber-500' : category.color.includes('purple') ? 'bg-purple-500' : 'bg-gray-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}