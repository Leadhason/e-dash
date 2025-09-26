import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Loader2, Package, DollarSign, X, Edit3, ShoppingBag, Star, Calendar } from "lucide-react";
import ProductVariantsManager from "@/components/products/product-variants-manager";
import ProductRatingsManager from "@/components/products/product-ratings-manager";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Product, Category, Supplier } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import { ImageUploadWithRef } from "@/components/ui/image-upload";
import { uploadProductImages } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const addProductSchema = z.object({
  sku: z.string()
    .min(1, "SKU is required")
    .max(100, "SKU must be less than 100 characters")
    .regex(/^[A-Z0-9-_]+$/, "SKU can only contain uppercase letters, numbers, hyphens, and underscores"),
  name: z.string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters"),
  description: z.string().optional(),
  detailedSpecifications: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).min(1, "Please select at least one category"),
  brand: z.string().optional(),
  images: z.array(z.string()).max(4, "Maximum 4 images allowed").default([]),
  sellingPrice: z.string()
    .min(1, "Selling price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price"),
  costPrice: z.string()
    .optional()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), "Please enter a valid cost price"),
  supplierId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof addProductSchema>;

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const imageUploadRef = useRef<{ getFilesToUpload: () => File[]; clearPreviews: () => void }>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      detailedSpecifications: "",
      categoryIds: [],
      brand: "",
      images: [],
      sellingPrice: "",
      costPrice: "",
      supplierId: "",
      isActive: true,
    },
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories?activeOnly=true', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }
      return response.json();
    },
  });

  // Handle product card click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  // Handle closing product details
  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
    setIsEditing(false);
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    // Pre-populate form with product data
    form.reset({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      detailedSpecifications: product.detailedSpecifications || "",
      categoryIds: product.categoryIds || [],
      brand: product.brand || "",
      images: product.images || [],
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice || "",
      supplierId: product.supplierId || "",
      isActive: product.isActive,
    });
    setIsEditing(true);
    setIsAddDialogOpen(true);
  };

  // Listen for escape key to close product details
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseProductDetails();
      }
    };

    if (selectedProduct) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedProduct]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitProgress(isEditing ? "Updating product..." : "Preparing product...");
    
    try {
      // Additional validation for editing mode
      if (isEditing && !selectedProduct) {
        throw new Error("No product selected for editing");
      }

      // Prepare product data with uploaded image URLs
      let finalImageUrls: string[] = [...data.images];
      
      // Check if there are new files to upload
      if (imageUploadRef.current) {
        const filesToUpload = imageUploadRef.current.getFilesToUpload();
        
        if (filesToUpload.length > 0) {
          // Validate total image count
          if (finalImageUrls.length + filesToUpload.length > 4) {
            throw new Error("Maximum 4 images allowed. Please remove some existing images first.");
          }

          setSubmitProgress(`Uploading ${filesToUpload.length} image(s)...`);
          
          try {
            // Upload images first (but show unified progress)
            const newImageUrls = await uploadProductImages(filesToUpload, data.sku);
            finalImageUrls = [...finalImageUrls, ...newImageUrls];
            
            // Clear previews after successful upload
            imageUploadRef.current.clearPreviews();
          } catch (uploadError) {
            throw new Error(`Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        }
      }

      setSubmitProgress(isEditing ? "Saving changes..." : "Saving product details...");

      // Create or update product with all image URLs
      const productData = {
        ...data,
        images: finalImageUrls,
        supplierId: data.supplierId === "none" ? null : data.supplierId
      };

      const url = isEditing && selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || (isEditing ? 'Failed to update product' : 'Failed to create product');
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: isEditing 
          ? `Product updated successfully${finalImageUrls.length > 0 ? ` with ${finalImageUrls.length} image(s)` : ''}`
          : `Product created successfully${finalImageUrls.length > 0 ? ` with ${finalImageUrls.length} image(s)` : ''}`,
      });

      form.reset();
      setIsAddDialogOpen(false);
      setIsEditing(false);
      
      // If we were editing, update the selected product
      if (isEditing && selectedProduct) {
        try {
          const updatedProduct = await response.json();
          setSelectedProduct(updatedProduct);
        } catch (parseError) {
          console.warn('Failed to parse updated product data:', parseError);
          // Still invalidate queries to refresh the data
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : (isEditing ? "Failed to update product. Please try again." : "Failed to create product. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get category display name
  const getCategoryDisplay = (categoryId: string) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  // Helper function to get category color based on category name
  const getCategoryColor = (categoryId: string) => {
    const category = categories?.find(cat => cat.id === categoryId);
    if (!category) return "bg-gray-100 text-gray-800";
    
    // Generate consistent colors based on category name
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800", 
      "bg-red-100 text-red-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-cyan-100 text-cyan-800"
    ];
    
    // Simple hash of category name to pick consistent color
    const hash = category.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Filter products based on search and category
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter || categoryFilter === "all" || product.categoryId === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="flex justify-between items-center p-5">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Product Catalog</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your tools and equipment inventory
                  </p>
                </div>
              </div>
            </div>

            {/* Add Product Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-product-button" className="bg-black">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[600px] w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {isEditing ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update product information in your catalog." : "Create a new product in your catalog."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., DRL-001-BLK" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            className={cn(inputStyles, "uppercase")}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for this product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cordless Drill" className={cn(inputStyles)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the product..." 
                          className="resize-none border border-gray-300"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="detailedSpecifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Specifications</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter detailed technical specifications, features, dimensions, materials, certifications, etc..." 
                          className="resize-y border border-gray-300 min-h-[120px] max-h-[300px] font-mono text-sm"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide comprehensive technical details. This field supports lengthy documents and line breaks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <ImageUploadWithRef
                          ref={imageUploadRef}
                          images={field.value || []}
                          onImagesChange={field.onChange}
                          maxImages={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload up to 4 product images. Supported formats: PNG, JPG, JPEG, WebP
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                            {categories?.map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`category-${category.id}`}
                                  checked={field.value?.includes(category.id) || false}
                                  onChange={(e) => {
                                    const currentValues = field.value || [];
                                    if (e.target.checked) {
                                      field.onChange([...currentValues, category.id]);
                                    } else {
                                      field.onChange(currentValues.filter(id => id !== category.id));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {category.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          {field.value && field.value.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {field.value.length} categories selected
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., DeWalt" className={cn(inputStyles)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={cn(inputStyles)}>
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No supplier</SelectItem>
                            {suppliers?.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              placeholder="0.00" 
                              className={cn(inputStyles, "pl-8")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input 
                              placeholder="0.00" 
                              className={cn(inputStyles, "pl-8")}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Product</FormLabel>
                        <FormDescription>
                          Product is visible in catalog and available for purchase
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
                      setSubmitProgress("");
                      setIsEditing(false);
                      form.reset();
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin bg-black text-white" />}
                    {isSubmitting ? (submitProgress || (isEditing ? "Updating Product..." : "Creating Product...")) : (isEditing ? "Update Product" : "Create Product")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
          </div>

          {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-gray-300"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || (categoryFilter && categoryFilter !== "all")) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredProducts?.length || 0} products
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted"></div>
                  <div className="p-4">
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-6 bg-muted rounded w-32 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-border rounded-lg overflow-hidden hover:bg-accent transition-colors cursor-pointer"
                  data-testid={`product-card-${product.sku}`}
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-muted relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{product.images.length - 1}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className={getCategoryColor(product.categoryId)}>
                        {getCategoryDisplay(product.categoryId)}
                      </Badge>
                      {!product.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">SKU: {product.sku}</p>
                    {product.brand && (
                      <p className="text-sm text-muted-foreground mb-3">{product.brand}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-foreground">
                        ${parseFloat(product.sellingPrice).toLocaleString()}
                      </span>
                      {product.costPrice && (
                        <span className="text-xs text-muted-foreground">
                          Cost: ${parseFloat(product.costPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found</p>
              {(searchQuery || (categoryFilter && categoryFilter !== "all")) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
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
        </div>

        {/* Product Details Cart-style Sidebar */}
        {selectedProduct && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300" 
              onClick={handleCloseProductDetails}
            />
            
            {/* Sliding Cart Sidebar */}
            <div className={cn(
              "fixed top-0 right-0 h-full w-full max-w-md lg:max-w-lg bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
              selectedProduct ? "translate-x-0" : "translate-x-full"
            )}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10 shadow-sm">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Product Details</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">View and manage product information</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseProductDetails}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

            {/* Product Details Content */}
            <div className="flex flex-col h-full">
              {/* Product Quick Info Header */}
              <div className="p-4 border-b border-border/50">
                <div className="space-y-3">
                  {/* Status and Category */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`${getCategoryColor(selectedProduct.categoryId)} text-xs`}>
                      {getCategoryDisplay(selectedProduct.categoryId)}
                    </Badge>
                    {!selectedProduct.isActive && (
                      <Badge variant="outline" className="text-xs">Inactive</Badge>
                    )}
                  </div>

                  {/* Product Name */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground leading-tight">{selectedProduct.name}</h3>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground font-medium">SKU: <span className="font-mono">{selectedProduct.sku}</span></p>
                      {selectedProduct.brand && (
                        <p className="text-xs text-muted-foreground">Brand: <span className="font-medium">{selectedProduct.brand}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-muted/20 rounded-lg p-3 border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pricing</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Selling Price</span>
                        <span className="text-lg font-bold text-foreground">
                          ${parseFloat(selectedProduct.sellingPrice).toLocaleString()}
                        </span>
                      </div>
                      {selectedProduct.costPrice && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Cost Price</span>
                            <span className="text-xs text-muted-foreground font-medium">
                              ${parseFloat(selectedProduct.costPrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-border/50">
                            <span className="text-xs font-medium text-foreground">Profit Margin</span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              {((parseFloat(selectedProduct.sellingPrice) - parseFloat(selectedProduct.costPrice)) / parseFloat(selectedProduct.sellingPrice) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleEditProduct(selectedProduct)}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium"
                    size="sm"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Product
                  </Button>
                </div>
              </div>

              {/* Tabbed Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="overview" className="flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-4 mx-4 mt-4 bg-muted/50">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="variants" className="text-xs">Variants</TabsTrigger>
                    <TabsTrigger value="reviews" className="text-xs">Reviews</TabsTrigger>
                    <TabsTrigger value="images" className="text-xs">Images</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="overview" className="p-4 space-y-5 mt-0">
                      {/* Description */}
                      {selectedProduct.description && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</h4>
                          <p className="text-sm text-foreground leading-relaxed bg-muted/10 rounded p-3 border">{selectedProduct.description}</p>
                        </div>
                      )}

                      {/* Detailed Specifications */}
                      {selectedProduct.detailedSpecifications && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Technical Specifications</h4>
                            <Badge variant="outline" className="text-xs">
                              {selectedProduct.detailedSpecifications.length > 500 ? 'Detailed' : 'Brief'}
                            </Badge>
                          </div>
                          <div className={`text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/10 rounded border font-mono ${
                            selectedProduct.detailedSpecifications.length > 500 
                              ? 'max-h-48 overflow-y-auto p-3' 
                              : 'p-3'
                          }`} style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgb(148 163 184 / 0.3) transparent'
                          }}>
                            {selectedProduct.detailedSpecifications}
                            {selectedProduct.detailedSpecifications.length > 500 && (
                              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30 bg-muted/20 -mx-3 -mb-3 px-3 py-2 sticky bottom-0">
                                💡 Scroll to view full specifications
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="space-y-2 pt-3 border-t border-border/50">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product History</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/10 rounded p-2">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Created</div>
                              <div className="text-xs">{new Date(selectedProduct.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/10 rounded p-2">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <div>
                              <div className="font-medium">Updated</div>
                              <div className="text-xs">{new Date(selectedProduct.updatedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="variants" className="p-4 mt-0">
                      <ProductVariantsManager 
                        productId={selectedProduct.id} 
                        productName={selectedProduct.name} 
                      />
                    </TabsContent>

                    <TabsContent value="reviews" className="p-4 mt-0">
                      <ProductRatingsManager 
                        productId={selectedProduct.id} 
                        productName={selectedProduct.name} 
                      />
                    </TabsContent>

                    <TabsContent value="images" className="p-4 mt-0">
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product Gallery</h4>
                            <Badge variant="secondary" className="text-xs">{selectedProduct.images.length} image{selectedProduct.images.length !== 1 ? 's' : ''}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedProduct.images.map((image, index) => (
                              <div key={index} className="group aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                                <img
                                  src={image}
                                  alt={`${selectedProduct.name} - Image ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">No images uploaded</p>
                          <p className="text-xs text-muted-foreground">
                            Edit this product to add product images
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}