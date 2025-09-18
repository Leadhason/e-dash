import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Loader2, Package, DollarSign, Ruler, Settings, Shield, ChevronRight, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Product } from "@shared/schema";
import { useState } from "react";
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
  // Basic Information
  sku: z.string()
    .min(1, "SKU is required")
    .max(100, "SKU must be less than 100 characters")
    .regex(/^[A-Z0-9-_]+$/, "SKU can only contain uppercase letters, numbers, hyphens, and underscores"),
  name: z.string()
    .min(1, "Product name is required")
    .max(255, "Name must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  category: z.enum(["power_tools", "hand_tools", "safety_equipment", "accessories", "replacement_parts"]),
  brand: z.string()
    .min(1, "Brand is required")
    .max(100, "Brand must be less than 100 characters"),
  
  // Pricing
  price: z.string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Price must be a positive number"),
  costPrice: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), "Cost price must be a non-negative number"),
  
  // Physical Properties
  weight: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), "Weight must be a non-negative number"),
  dimensions: z.object({
    width: z.string().optional(),
    height: z.string().optional(),
    depth: z.string().optional(),
  }).optional(),
  
  // Technical Specifications
  technicalSpecs: z.object({
    voltage: z.string().optional(),
    amperage: z.string().optional(),
    torque: z.string().optional(),
    powerSource: z.string().optional(),
  }).optional(),
  
  // Safety & Compliance
  safetyCompliance: z.object({
    ul: z.boolean().optional(),
    osha: z.boolean().optional(),
    ce: z.boolean().optional(),
  }).optional(),
  
  // Additional Settings
  warrantyMonths: z.number().min(0).max(120).optional(),
  isActive: z.boolean().optional(),
  isSeasonal: z.boolean().optional(),
  image: z.any().optional(),
});

type AddProductFormValues = z.infer<typeof addProductSchema>;

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      category: "power_tools",
      brand: "",
      price: "",
      costPrice: "",
      weight: "",
      dimensions: {
        width: "",
        height: "",
        depth: "",
      },
      technicalSpecs: {
        voltage: "",
        amperage: "",
        torque: "",
        powerSource: "Electric",
      },
      safetyCompliance: {
        ul: false,
        osha: false,
        ce: false,
      },
      warrantyMonths: 12,
      isActive: true,
      isSeasonal: false,
      image: null,
    },
  });

  // Add SKU uniqueness check
  const checkSKUUniqueness = async (sku: string) => {
    try {
      const response = await fetch(`/api/products/check-sku?sku=${encodeURIComponent(sku)}`, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      return !result.exists; // If SKU doesn't exist, it's available
    } catch (error) {
      return false; // Default to not allowing if check fails (safer)
    }
  };

  async function onSubmit(data: AddProductFormValues) {
    setIsSubmitting(true);
    try {
      // Check SKU uniqueness before submission
      const skuAvailable = await checkSKUUniqueness(data.sku);
      if (!skuAvailable) {
        form.setError("sku", {
          type: "manual",
          message: "This SKU already exists. Please use a different SKU."
        });
        setIsSubmitting(false);
        return;
      }

      // Format and validate numeric values
      const formattedData = {
        ...data,
        price: data.price ? parseFloat(data.price).toString() : undefined,
        costPrice: data.costPrice && data.costPrice.trim() !== "" ? parseFloat(data.costPrice).toString() : undefined,
        weight: data.weight && data.weight.trim() !== "" ? parseFloat(data.weight).toString() : undefined,
        dimensions: data.dimensions ? {
          width: data.dimensions.width && data.dimensions.width.trim() !== "" ? parseFloat(data.dimensions.width).toString() : undefined,
          height: data.dimensions.height && data.dimensions.height.trim() !== "" ? parseFloat(data.dimensions.height).toString() : undefined,
          depth: data.dimensions.depth && data.dimensions.depth.trim() !== "" ? parseFloat(data.dimensions.depth).toString() : undefined,
        } : undefined,
        technicalSpecs: {
          voltage: data.technicalSpecs?.voltage?.trim() || undefined,
          amperage: data.technicalSpecs?.amperage?.trim() || undefined,
          torque: data.technicalSpecs?.torque?.trim() || undefined,
          powerSource: data.technicalSpecs?.powerSource || undefined,
        },
        safetyCompliance: {
          ul: data.safetyCompliance?.ul || false,
          osha: data.safetyCompliance?.osha || false,
          ce: data.safetyCompliance?.ce || false,
        },
        warrantyMonths: data.warrantyMonths ? Number(data.warrantyMonths) : 12,
        isActive: data.isActive ?? true,
        isSeasonal: data.isSeasonal ?? false,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          form.setError("sku", {
            type: "manual",
            message: "This SKU already exists. Please use a different SKU."
          });
          toast({
            title: "Duplicate SKU",
            description: "This SKU already exists. Please use a different SKU.",
            variant: "destructive",
          });
          return;
        }

        if (response.status === 400) {
          toast({
            title: "Invalid product data",
            description: result.message || "Please check all required fields and try again.",
            variant: "destructive",
          });
          return;
        }

        throw new Error(result.message || "Failed to add product");
      }

      // Invalidate and refetch products query
      await queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      toast({
        title: "Product added successfully",
        description: `${data.name} has been added to the catalog.`,
      });

      form.reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error adding product",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
      <div className="flex justify-between items-center p-5">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Product Catalog</h1>
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
              <DialogContent className="max-w-[1200px] w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-4 border-b bg-background flex-shrink-0">
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Add New Product
                  </DialogTitle>
                  <DialogDescription>
                    Create a new product with detailed specifications and pricing information.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                    <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0">
                      <TabsList className="mx-6 mt-4 grid w-full grid-cols-5 flex-shrink-0">
                        <TabsTrigger value="basic" className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Basic
                        </TabsTrigger>
                        <TabsTrigger value="pricing" className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Pricing
                        </TabsTrigger>
                        <TabsTrigger value="specs" className="flex items-center gap-2">
                          <Ruler className="h-4 w-4" />
                          Specs
                        </TabsTrigger>
                        <TabsTrigger value="safety" className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Safety
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </TabsTrigger>
                      </TabsList>

                      {/* Tab Content Container with proper scrolling */}
                      <div className="flex-1 min-h-0 overflow-hidden">
                        
                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="h-full px-6 py-4 overflow-y-auto space-y-6 mt-0"
                          style={{ maxHeight: 'calc(95vh - 200px)' }}>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Product Information</h3>
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
                                      <Input placeholder="Enter product name" className={cn(inputStyles)} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Category *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className={cn(inputStyles)}>
                                          <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="power_tools">Power Tools</SelectItem>
                                        <SelectItem value="hand_tools">Hand Tools</SelectItem>
                                        <SelectItem value="safety_equipment">Safety Equipment</SelectItem>
                                        <SelectItem value="accessories">Accessories</SelectItem>
                                        <SelectItem value="replacement_parts">Replacement Parts</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Brand *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., DeWalt, Milwaukee" className={cn(inputStyles)} {...field} />
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
                                <FormItem className="mt-4">
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Detailed product description, features, and specifications..."
                                      rows={4}
                                      className={cn("border border-gray-300 bg-background focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-400")}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Provide a detailed description to help customers understand the product
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        {/* Pricing Tab */}
                        <TabsContent value="pricing" className="h-full px-6 py-4 overflow-y-auto space-y-6 mt-0"
                          style={{ maxHeight: 'calc(95vh - 200px)' }}>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Pricing Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="price"
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
                                    <FormDescription>
                                      The price customers will pay
                                    </FormDescription>
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
                                    <FormDescription>
                                      Your cost for this product
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            {form.watch('price') && form.watch('costPrice') && (
                              <div className="mt-4 p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Profit Analysis</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <div className="text-muted-foreground">Margin</div>
                                    <div className="font-medium">
                                      ${(parseFloat(form.watch('price') || '0') - parseFloat(form.watch('costPrice') || '0')).toFixed(2)}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Markup</div>
                                    <div className="font-medium">
                                      {form.watch('costPrice') ? 
                                        (((parseFloat(form.watch('price') || '0') - parseFloat(form.watch('costPrice') || '0')) / parseFloat(form.watch('costPrice') || '1')) * 100).toFixed(1) + '%'
                                        : '0%'
                                      }
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Margin %</div>
                                    <div className="font-medium">
                                      {form.watch('price') ? 
                                        (((parseFloat(form.watch('price') || '0') - parseFloat(form.watch('costPrice') || '0')) / parseFloat(form.watch('price') || '1')) * 100).toFixed(1) + '%'
                                        : '0%'
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        {/* Specifications Tab */}
                        <TabsContent value="specs" className="h-full px-6 py-4 overflow-y-auto space-y-6 mt-0"
                          style={{ maxHeight: 'calc(95vh - 200px)' }}>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Physical & Technical Specifications</h3>
                            
                            {/* Physical Properties */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Physical Properties</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="weight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Weight (lbs)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="0.0" className={cn(inputStyles)} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="warrantyMonths"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Warranty (months)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number" 
                                          placeholder="12" 
                                          className={cn(inputStyles)}
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Warranty period in months
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Dimensions */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Dimensions (inches)</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name="dimensions.width"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Width</FormLabel>
                                      <FormControl>
                                        <Input placeholder="0.0" className={cn(inputStyles)} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="dimensions.height"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Height</FormLabel>
                                      <FormControl>
                                        <Input placeholder="0.0" className={cn(inputStyles)} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="dimensions.depth"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Depth</FormLabel>
                                      <FormControl>
                                        <Input placeholder="0.0" className={cn(inputStyles)} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Technical Specifications */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Technical Specifications</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="technicalSpecs.voltage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Voltage</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., 120V" className={cn(inputStyles)} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="technicalSpecs.amperage"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Amperage</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., 15A" className={cn(inputStyles)} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="technicalSpecs.powerSource"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Power Source</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className={cn(inputStyles)}>
                                            <SelectValue placeholder="Select power source" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Electric">Electric</SelectItem>
                                          <SelectItem value="Battery">Battery</SelectItem>
                                          <SelectItem value="Pneumatic">Pneumatic</SelectItem>
                                          <SelectItem value="Manual">Manual</SelectItem>
                                          <SelectItem value="Hydraulic">Hydraulic</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="technicalSpecs.torque"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Torque</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., 50 ft-lbs" className={cn(inputStyles)} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Safety & Compliance Tab */}
                        <TabsContent value="safety" className="h-full px-6 py-4 overflow-y-auto space-y-6 mt-0"
                          style={{ maxHeight: 'calc(95vh - 200px)' }}>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Safety & Compliance</h3>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Certifications</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name="safetyCompliance.ul"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>UL Listed</FormLabel>
                                        <FormDescription>
                                          Underwriters Laboratories certified
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="safetyCompliance.osha"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>OSHA Compliant</FormLabel>
                                        <FormDescription>
                                          Meets OSHA safety standards
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="safetyCompliance.ce"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>CE Marked</FormLabel>
                                        <FormDescription>
                                          European Conformity marking
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="h-full px-6 py-4 overflow-y-auto space-y-6 mt-0"
                          style={{ maxHeight: 'calc(95vh - 200px)' }}>
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Product Settings</h3>
                            
                            <div className="space-y-6">
                              <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Product Image</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          field.onChange(file);
                                        }}
                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Upload a high-quality product image (JPG, PNG, WebP)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-2 gap-6">
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
                                <FormField
                                  control={form.control}
                                  name="isSeasonal"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                                      <div className="space-y-0.5">
                                        <FormLabel className="text-base">Seasonal Item</FormLabel>
                                        <FormDescription>
                                          Product has seasonal availability patterns
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
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-between items-center px-6 py-4 border-t bg-background flex-shrink-0 mt-auto">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsAddDialogOpen(false);
                            form.reset();
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <div className="flex gap-3">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => form.reset()}
                            disabled={isSubmitting}
                          >
                            Reset Form
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="min-w-[120px] bg-black text-white"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Tabs>
                  </form>
                </Form>
              </DialogContent>
        </Dialog>
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
                  className={cn("pl-10", inputStyles)}
                  data-testid="product-search-input"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className={cn("w-48", inputStyles)} data-testid="category-filter">
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
