import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Tags, Package, Edit, Trash2, Loader2, Save, X, GripVertical, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Category } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const inputStyles = "h-10 border border-gray-300 bg-background focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400";

const addCategorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  isActive: z.boolean().default(true),
});

const editCategorySchema = z.object({
  name: z.string()
    .min(1, "Category name is required")
    .max(100, "Category name must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof addCategorySchema>;
type EditFormData = z.infer<typeof editCategorySchema>;

interface CategoryWithProductCount extends Category {
  productCount?: number;
}

interface EditingState {
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function Categories() {
  const isMobile = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EditingState | null>(null);
  const [deleteDialogCategory, setDeleteDialogCategory] = useState<CategoryWithProductCount | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories with optimized caching
  const { data: categoriesWithCount = [], isLoading, isError, error, refetch } = useQuery<CategoryWithProductCount[]>({
    queryKey: ['/api/categories', 'withCount'],
    queryFn: async () => {
      const response = await fetch('/api/categories?includeProductCount=true', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Generate slug from name
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const categoryData = {
        name: data.name,
        description: data.description,
        slug,
        isActive: data.isActive,
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories', 'withCount'] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      form.reset();
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditFormData }) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories', 'withCount'] });
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation (with cascade and optimistic updates)
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      console.log('Deleting category with ID:', categoryId);
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
        throw new Error(`Failed to delete category: ${response.status}`);
      }

      // Return null for 204 No Content response
      return response.status === 204 ? null : response.json();
    },
    onMutate: async (categoryId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/categories', 'withCount'] });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData(['/api/categories', 'withCount']);

      // Optimistically update to remove the category
      queryClient.setQueryData<CategoryWithProductCount[]>(['/api/categories', 'withCount'], (old = []) => {
        return old.filter(category => category.id !== categoryId);
      });

      // Return a context object with the snapshotted value
      return { previousCategories };
    },
    onError: (err, categoryId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCategories) {
        queryClient.setQueryData(['/api/categories', 'withCount'], context.previousCategories);
      }
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      setDeleteDialogCategory(null);
      toast({
        title: "Success",
        description: "Category and all associated products deleted successfully",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['/api/categories', 'withCount'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] }); // Refresh products too
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    createCategoryMutation.mutate(data);
  };

  // Editing functions
  const startEditing = (category: Category) => {
    setEditingCategory({
      categoryId: category.id,
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  const saveEditing = () => {
    if (!editingCategory) return;
    
    updateCategoryMutation.mutate({
      id: editingCategory.categoryId,
      data: {
        name: editingCategory.name,
        description: editingCategory.description,
        isActive: editingCategory.isActive,
      }
    });
  };

  const updateEditingField = (field: keyof Omit<EditingState, 'categoryId'>, value: string | boolean) => {
    if (!editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      [field]: value,
    });
  };

  // Delete confirmation
  const confirmDelete = (category: CategoryWithProductCount) => {
    setDeleteDialogCategory(category);
  };

  const executeDelete = () => {
    if (!deleteDialogCategory) return;
    console.log('Executing delete for category:', deleteDialogCategory.id);
    deleteCategoryMutation.mutate(deleteDialogCategory.id);
  };

  // Helper function to get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  // Error handling
  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load categories</h3>
          <p className="text-gray-600 mb-4 max-w-md">
            {error instanceof Error ? error.message : "We're having trouble loading your categories. Please try again."}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header - Mobile Responsive */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Tags className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                {isMobile ? "Categories" : "Product Categories"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                {isMobile ? "Organize your catalog" : "Organize your product catalog by categories"}
              </p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="add-category-button" 
                className="bg-black hover:bg-gray-800 w-full md:w-auto"
                size={isMobile ? "default" : "default"}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isMobile ? "Add" : "Add Category"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] w-[95vw] mx-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Add New Category
                </DialogTitle>
                <DialogDescription>
                  Create a new category to organize your products.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Power Tools" 
                            className={cn(inputStyles)}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Choose a clear, descriptive name for this category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of this category..." 
                            className="resize-none border border-gray-300"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a brief description to help users understand this category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Category</FormLabel>
                          <FormDescription>
                            Category is visible and available for product assignment
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        form.reset();
                      }}
                  disabled={createCategoryMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCategoryMutation.isPending}
                  className="bg-black hover:bg-gray-800"
                >
                  {createCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createCategoryMutation.isPending ? "Creating Category..." : "Create Category"}
                </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : categoriesWithCount.length}
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
                  Active Categories
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : categoriesWithCount.filter(cat => cat.isActive).length}
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
                  Created This Month
                </p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : categoriesWithCount.filter((cat: CategoryWithProductCount) => {
                    const created = new Date(cat.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
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
              {isLoading ? "Loading..." : `${categoriesWithCount.length} categories`}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {/* Loading skeleton for category cards */}
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-6 space-y-4 animate-pulse"
                >
                  <div className="flex items-start justify-between">
                    {/* Left side - Category content skeleton */}
                    <div className="flex-1 space-y-3">
                      {/* Category name and drag handle */}
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                      </div>

                      {/* Description skeleton */}
                      <div className="ml-9 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>

                      {/* Metadata skeleton */}
                      <div className="ml-9 flex items-center space-x-4">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>

                    {/* Right side - Actions skeleton */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading text with animation */}
              <div className="text-center py-4">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading categories...</span>
                </div>
              </div>
            </div>
          ) : categoriesWithCount.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Tags className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first category</p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-black hover:bg-gray-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {categoriesWithCount.map((category) => {
                const isEditing = editingCategory?.categoryId === category.id;
                
                return (
                  <div
                    key={category.id}
                    className={cn(
                      "group border border-border rounded-lg p-4 md:p-6 transition-all duration-200 hover:shadow-md",
                      isEditing && "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50/30"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      {/* Left side - Category content */}
                      <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                        {/* Category name and drag handle */}
                        <div className="flex items-center space-x-2 md:space-x-3">
                          {!isMobile && (
                            <div className="cursor-grab hover:cursor-grabbing p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                              <GripVertical className="h-4 w-4" />
                            </div>
                          )}
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Tags className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={editingCategory.name}
                                  onChange={(e) => updateEditingField('name', e.target.value)}
                                  className="font-medium text-base md:text-lg h-8 border-0 bg-transparent p-0 focus-visible:ring-0"
                                  placeholder="Category name..."
                                />
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={editingCategory.isActive}
                                    onCheckedChange={(checked) => updateEditingField('isActive', checked)}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {editingCategory.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <h3 className="font-medium text-base md:text-lg text-foreground group-hover:text-blue-600 transition-colors truncate">
                                  {category.name}
                                </h3>
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <Badge className={getStatusColor(category.isActive)}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {category.productCount !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      {category.productCount} {isMobile ? 'items' : 'products'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div className={`${!isMobile ? 'ml-9' : 'ml-0'}`}>
                          {isEditing ? (
                            <Textarea
                              value={editingCategory.description}
                              onChange={(e) => updateEditingField('description', e.target.value)}
                              className="min-h-[60px] md:min-h-[80px] border-dashed border-gray-300 bg-gray-50/50 text-sm"
                              placeholder="Category description..."
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {category.description || "No description provided"}
                            </p>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="ml-9 flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Slug: <code className="bg-muted px-1 py-0.5 rounded">{category.slug}</code></span>
                          <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                          {category.sortOrder && <span>Order: {category.sortOrder}</span>}
                        </div>
                      </div>

                      {/* Right side - Actions */}
                      <div className={`flex items-center space-x-1 md:space-x-2 ${isMobile ? 'ml-2' : 'ml-4'} flex-shrink-0`}>
                        {isEditing ? (
                          <>
                            <Button
                              size={isMobile ? "sm" : "sm"}
                              onClick={saveEditing}
                              disabled={updateCategoryMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 md:h-9 md:w-auto md:px-3"
                            >
                              {updateCategoryMutation.isPending ? (
                                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3 md:h-4 md:w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size={isMobile ? "sm" : "sm"}
                              onClick={cancelEditing}
                              disabled={updateCategoryMutation.isPending}
                              className="h-8 w-8 md:h-9 md:w-auto md:px-3"
                            >
                              <X className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size={isMobile ? "sm" : "sm"}
                              onClick={() => startEditing(category)}
                              className={`h-8 w-8 md:h-9 md:w-auto md:px-3 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                            >
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size={isMobile ? "sm" : "sm"}
                              onClick={() => confirmDelete(category)}
                              className={`h-8 w-8 md:h-9 md:w-auto md:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                            >
                              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogCategory} onOpenChange={() => setDeleteDialogCategory(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Delete Category</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You are about to delete the category <strong>"{deleteDialogCategory?.name}"</strong>.
              </p>
              
              {deleteDialogCategory?.productCount !== undefined && deleteDialogCategory.productCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Warning: This will also delete {deleteDialogCategory.productCount} product{deleteDialogCategory.productCount !== 1 ? 's' : ''}</p>
                      <p className="mt-1">All products in this category will be permanently removed from your inventory.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-sm">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              disabled={deleteCategoryMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}