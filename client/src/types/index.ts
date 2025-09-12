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
