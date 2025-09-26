import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Package,
  DollarSign,
  Hash,
  Palette,
  Ruler,
  Tag
} from "lucide-react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ProductVariant } from "@/types/index";

interface ProductVariantsManagerProps {
  productId: string;
  productName: string;
}

const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  attributes: z.array(z.object({
    type: z.string().min(1, "Attribute type is required"),
    value: z.string().min(1, "Attribute value is required")
  })).min(1, "At least one attribute is required"),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative"),
  additionalPrice: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Invalid price format"),
  images: z.array(z.string()).default([])
});

type VariantFormData = z.infer<typeof variantSchema>;

export function ProductVariantsManager({ productId, productName }: ProductVariantsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [newAttribute, setNewAttribute] = useState({ type: "", value: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: "",
      attributes: [],
      stockQuantity: 0,
      additionalPrice: "0.00",
      images: []
    }
  });

  const { data: variants, isLoading } = useQuery<ProductVariant[]>({
    queryKey: [`/api/products/${productId}/variants`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/variants`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch variants");
      return response.json();
    },
  });

  const createVariantMutation = useMutation({
    mutationFn: async (data: VariantFormData) => {
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create variant");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/variants`] });
      setIsDialogOpen(false);
      setEditingVariant(null);
      form.reset();
      toast({
        title: "Success",
        description: "Product variant created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VariantFormData }) => {
      const response = await fetch(`/api/product-variants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update variant");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/variants`] });
      setIsDialogOpen(false);
      setEditingVariant(null);
      form.reset();
      toast({
        title: "Success",
        description: "Product variant updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/product-variants/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete variant");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/variants`] });
      toast({
        title: "Success",
        description: "Product variant deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    form.reset({
      sku: variant.sku,
      attributes: variant.attributes,
      stockQuantity: variant.stockQuantity,
      additionalPrice: variant.additionalPrice,
      images: variant.images
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (variant: ProductVariant) => {
    if (confirm(`Are you sure you want to delete variant "${variant.sku}"?`)) {
      deleteVariantMutation.mutate(variant.id);
    }
  };

  const onSubmit = (data: VariantFormData) => {
    if (editingVariant) {
      updateVariantMutation.mutate({ id: editingVariant.id, data });
    } else {
      createVariantMutation.mutate(data);
    }
  };

  const addAttribute = () => {
    if (newAttribute.type && newAttribute.value) {
      const currentAttributes = form.getValues("attributes") || [];
      form.setValue("attributes", [...currentAttributes, newAttribute]);
      setNewAttribute({ type: "", value: "" });
    }
  };

  const removeAttribute = (index: number) => {
    const currentAttributes = form.getValues("attributes") || [];
    form.setValue("attributes", currentAttributes.filter((_, i) => i !== index));
  };

  const getAttributeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'color':
      case 'colour':
        return <Palette className="h-3 w-3" />;
      case 'size':
        return <Ruler className="h-3 w-3" />;
      default:
        return <Tag className="h-3 w-3" />;
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingVariant(null);
    form.reset();
    setNewAttribute({ type: "", value: "" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Variants
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage different variations of {productName}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingVariant ? "Edit Product Variant" : "Add New Product Variant"}
                </DialogTitle>
                <DialogDescription>
                  {editingVariant 
                    ? "Update the variant details below."
                    : "Create a new variation of this product with different attributes."
                  }
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
                          <FormLabel>Variant SKU *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., DRL-001-BLK-L"
                              {...field}
                              className="border-gray-300 focus:border-gray-300 focus:ring-0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              className="border-gray-300 focus:border-gray-300 focus:ring-0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Price (can be negative)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              placeholder="0.00"
                              {...field}
                              className="pl-8 border-gray-300 focus:border-gray-300 focus:ring-0"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <Label>Variant Attributes *</Label>
                    
                    {/* Add new attribute */}
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Type (e.g., Color)"
                        value={newAttribute.type}
                        onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}
                        className="border-gray-300 focus:border-gray-300 focus:ring-0"
                      />
                      <Input
                        placeholder="Value (e.g., Red)"
                        value={newAttribute.value}
                        onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                        className="border-gray-300 focus:border-gray-300 focus:ring-0"
                      />
                      <Button type="button" onClick={addAttribute} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Display current attributes */}
                    <div className="space-y-2">
                      {form.watch("attributes")?.map((attr, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          {getAttributeIcon(attr.type)}
                          <span className="text-sm font-medium">{attr.type}:</span>
                          <Badge variant="secondary" className="text-xs">
                            {attr.value}
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAttribute(index)}
                            className="ml-auto h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {(!form.watch("attributes") || form.watch("attributes").length === 0) && (
                        <p className="text-xs text-muted-foreground">No attributes added yet</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createVariantMutation.isPending || updateVariantMutation.isPending}
                    >
                      {createVariantMutation.isPending || updateVariantMutation.isPending
                        ? (editingVariant ? "Updating..." : "Creating...")
                        : (editingVariant ? "Update Variant" : "Create Variant")
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-3 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="ml-auto h-4 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : variants?.length ? (
          <div className="space-y-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="border border-border rounded-lg p-4 hover:bg-accent transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium">{variant.sku}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{variant.stockQuantity} in stock</span>
                      </div>
                      {parseFloat(variant.additionalPrice) !== 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm font-medium ${
                            parseFloat(variant.additionalPrice) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {parseFloat(variant.additionalPrice) > 0 ? '+' : ''}
                            ${variant.additionalPrice}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {variant.attributes.map((attr, index) => (
                        <div key={index} className="flex items-center gap-1">
                          {getAttributeIcon(attr.type)}
                          <Badge variant="outline" className="text-xs">
                            {attr.type}: {attr.value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(variant)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(variant)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No variants created yet</p>
            <p className="text-xs text-muted-foreground">
              Create variants to offer different options like size, color, or style
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProductVariantsManager;