export interface DashboardMetrics {
  monthlyRevenue: number;
  activeOrders: number;
  lowStockItems: number;
  warrantyClaimsCount: number;
}

export interface OrderWithCustomer {
  id: string;
  orderNumber: string;
  customerId: string;
  orderType: string;
  status: string;
  subtotal: string;
  taxAmount?: string;
  shippingAmount?: string;
  totalAmount: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    companyName?: string;
    contactFirstName: string;
    contactLastName: string;
    customerType: string;
  };
}

export interface InventoryWithProduct {
  id: string;
  productId: string;
  location: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint?: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string;
    brand?: string;
  };
}

export interface WarrantyWithDetails {
  id: string;
  productId: string;
  customerId: string;
  orderId?: string;
  serialNumber?: string;
  purchaseDate: Date;
  warrantyStartDate: Date;
  warrantyEndDate: Date;
  status: string;
  claimDate?: Date;
  claimReason?: string;
  resolutionNotes?: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    brand?: string;
  };
  customer?: {
    id: string;
    companyName?: string;
    contactFirstName: string;
    contactLastName: string;
  };
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
}

export interface ProductWithDetails {
  id: string;
  sku: string;
  name: string;
  description: string;
  detailedSpecifications: string;
  categoryIds: string[];
  brand: string;
  costPrice: string;
  sellingPrice: string;
  originalPrice?: string;
  discountPercentage?: number;
  weight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  images: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  supplierId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  supplier?: {
    id: string;
    name: string;
    contactEmail?: string;
  };
  variants?: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  attributes: Array<{
    type: string;
    value: string;
  }>;
  stockQuantity: number;
  additionalPrice: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRating {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  createdAt: Date;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  reviewText: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}
