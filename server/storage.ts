import { 
  type User, 
  type InsertUser, 
  type Customer, 
  type InsertCustomer,
  type Category,
  type InsertCategory,
  type Product, 
  type InsertProduct,
  type Supplier,
  type InsertSupplier,
  type ProductVariant,
  type InsertProductVariant,
  type ProductRating,
  type InsertProductRating,
  type ProductReview,
  type InsertProductReview,
  type Inventory, 
  type InsertInventory,
  type Order, 
  type InsertOrder,
  type OrderItem, 
  type InsertOrderItem,
  type Warranty, 
  type InsertWarranty,
  type Vendor, 
  type InsertVendor,
  type UserRole,
  users,
  customers,
  categories,
  products,
  suppliers,
  productVariants,
  productRatings,
  productReviews,
  inventory,
  orders,
  orderItems,
  warranties,
  vendors
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, like, sql, and, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
  getCustomersByType(type: string): Promise<Customer[]>;

  // Category methods
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;
  getActiveCategories(): Promise<Category[]>;
  getCategoriesWithProductCount(activeOnly?: boolean, limit?: number): Promise<(Category & { productCount: number })[]>;
  getCategoriesMinimal(): Promise<{ id: string; name: string; slug: string }[]>;
  checkSlugExists(slug: string): Promise<boolean>;

  // Supplier methods
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
  getAllSuppliers(): Promise<Supplier[]>;

  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  checkSkuExists(sku: string): Promise<boolean>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;

  // Product Variant methods
  getProductVariant(id: string): Promise<ProductVariant | undefined>;
  getProductVariantsBySku(sku: string): Promise<ProductVariant | undefined>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  updateProductVariant(id: string, variant: Partial<InsertProductVariant>): Promise<ProductVariant | undefined>;
  deleteProductVariant(id: string): Promise<boolean>;
  getProductVariantsByProduct(productId: string): Promise<ProductVariant[]>;

  // Product Rating methods
  getProductRating(id: string): Promise<ProductRating | undefined>;
  createProductRating(rating: InsertProductRating): Promise<ProductRating>;
  getProductRatingsByProduct(productId: string): Promise<ProductRating[]>;
  getProductRatingsByCustomer(customerId: string): Promise<ProductRating[]>;

  // Product Review methods
  getProductReview(id: string): Promise<ProductReview | undefined>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  updateProductReview(id: string, review: Partial<InsertProductReview>): Promise<ProductReview | undefined>;
  deleteProductReview(id: string): Promise<boolean>;
  getProductReviewsByProduct(productId: string): Promise<ProductReview[]>;
  getProductReviewsByCustomer(customerId: string): Promise<ProductReview[]>;

  // Inventory methods
  getInventory(productId: string, location?: string): Promise<Inventory[]>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: string, inventory: Partial<InsertInventory>): Promise<Inventory | undefined>;
  getAllInventory(): Promise<Inventory[]>;
  getLowStockItems(threshold?: number): Promise<Inventory[]>;

  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getRecentOrders(limit?: number): Promise<Order[]>;

  // Order Item methods
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  // Warranty methods
  getWarranty(id: string): Promise<Warranty | undefined>;
  createWarranty(warranty: InsertWarranty): Promise<Warranty>;
  updateWarranty(id: string, warranty: Partial<InsertWarranty>): Promise<Warranty | undefined>;
  getAllWarranties(): Promise<Warranty[]>;
  getWarrantiesByCustomer(customerId: string): Promise<Warranty[]>;
  getWarrantiesByStatus(status: string): Promise<Warranty[]>;
  getActiveWarranties(): Promise<Warranty[]>;

  // Vendor methods
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  getAllVendors(): Promise<Vendor[]>;
  getActiveVendors(): Promise<Vendor[]>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    monthlyRevenue: number;
    activeOrders: number;
    lowStockItems: number;
    warrantyClaimsCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private customers: Map<string, Customer>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private inventory: Map<string, Inventory>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private warranties: Map<string, Warranty>;
  private vendors: Map<string, Vendor>;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.inventory = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.warranties = new Map();
    this.vendors = new Map();

    // Initialize with a default admin user
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@toolstech.com",
      password: "$2a$10$rOUFGcvQnQkfxPLgzZzN8eJ9.8JbFcA4Z9GZ1dGZTgW5PgFBP4.uS", // "admin123"
      firstName: "Sarah",
      lastName: "Johnson",
      role: "super_admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "customer_service",
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updateData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(customer => customer.email === email);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      companyName: insertCustomer.companyName || null,
      phone: insertCustomer.phone || null,
      taxExempt: insertCustomer.taxExempt || null,
      creditLimit: insertCustomer.creditLimit || null,
      paymentTerms: insertCustomer.paymentTerms || null,
      address: insertCustomer.address || null,
      isActive: insertCustomer.isActive !== undefined ? insertCustomer.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer: Customer = {
      ...customer,
      ...updateData,
      updatedAt: new Date()
    };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomersByType(type: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(customer => customer.customerType === type);
  }

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
      isActive: insertCategory.isActive !== undefined ? insertCategory.isActive : true,
      sortOrder: insertCategory.sortOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory: Category = {
      ...category,
      ...updateData,
      updatedAt: new Date()
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    // First, delete all products in this category
    const productsInCategory = await this.getProductsByCategory(id);
    for (const product of productsInCategory) {
      await this.deleteProduct(product.id);
    }
    
    // Then delete the category
    const deleted = this.categories.delete(id);
    return deleted;
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async getActiveCategories(): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async checkSlugExists(slug: string): Promise<boolean> {
    return Array.from(this.categories.values()).some(c => c.slug === slug);
  }

  async getCategoriesWithProductCount(activeOnly = false, limit?: number): Promise<(Category & { productCount: number })[]> {
    let categoriesArray = Array.from(this.categories.values());
    
    if (activeOnly) {
      categoriesArray = categoriesArray.filter(c => c.isActive);
    }
    
    categoriesArray.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name));
    
    if (limit) {
      categoriesArray = categoriesArray.slice(0, limit);
    }
    
    return categoriesArray.map(category => {
      const productCount = Array.from(this.products.values())
        .filter(p => p.categoryId === category.id && p.isActive).length;
      
      return {
        ...category,
        productCount
      };
    });
  }

  async getCategoriesMinimal(): Promise<{ id: string; name: string; slug: string }[]> {
    return Array.from(this.categories.values())
      .filter(c => c.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name))
      .map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug
      }));
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.sku === sku);
  }

  async checkSkuExists(sku: string): Promise<boolean> {
    return Array.from(this.products.values()).some(p => p.sku === sku);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      detailedSpecifications: insertProduct.detailedSpecifications || null,
      brand: insertProduct.brand || null,
      costPrice: insertProduct.costPrice || null,
      isActive: insertProduct.isActive !== undefined ? insertProduct.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      ...updateData,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery) ||
      product.brand?.toLowerCase().includes(lowerQuery)
    );
  }

  // Inventory methods
  async getInventory(productId: string, location?: string): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(inv => {
      if (location) {
        return inv.productId === productId && inv.location === location;
      }
      return inv.productId === productId;
    });
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const id = randomUUID();
    const inventory: Inventory = {
      ...insertInventory,
      id,
      quantityOnHand: insertInventory.quantityOnHand || 0,
      quantityReserved: insertInventory.quantityReserved || 0,
      quantityAvailable: insertInventory.quantityAvailable || 0,
      reorderPoint: insertInventory.reorderPoint || null,
      maxStock: insertInventory.maxStock || null,
      lastStockCheck: insertInventory.lastStockCheck || null,
      updatedAt: new Date()
    };
    this.inventory.set(id, inventory);
    return inventory;
  }

  async updateInventory(id: string, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const inventory = this.inventory.get(id);
    if (!inventory) return undefined;
    
    const updatedInventory: Inventory = {
      ...inventory,
      ...updateData,
      updatedAt: new Date()
    };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }

  async getAllInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getLowStockItems(threshold: number = 10): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(inv => inv.quantityAvailable <= threshold);
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.orderNumber === orderNumber);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      taxAmount: insertOrder.taxAmount || null,
      shippingAmount: insertOrder.shippingAmount || null,
      notes: insertOrder.notes || null,
      shippingAddress: insertOrder.shippingAddress || null,
      billingAddress: insertOrder.billingAddress || null,
      estimatedDelivery: insertOrder.estimatedDelivery || null,
      actualDelivery: insertOrder.actualDelivery || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = {
      ...order,
      ...updateData,
      updatedAt: new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.customerId === customerId);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.status === status);
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Order Item methods
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
      createdAt: new Date()
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Warranty methods
  async getWarranty(id: string): Promise<Warranty | undefined> {
    return this.warranties.get(id);
  }

  async createWarranty(insertWarranty: InsertWarranty): Promise<Warranty> {
    const id = randomUUID();
    const warranty: Warranty = {
      ...insertWarranty,
      id,
      status: insertWarranty.status || "active",
      orderId: insertWarranty.orderId || null,
      serialNumber: insertWarranty.serialNumber || null,
      claimDate: insertWarranty.claimDate || null,
      claimReason: insertWarranty.claimReason || null,
      resolutionNotes: insertWarranty.resolutionNotes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.warranties.set(id, warranty);
    return warranty;
  }

  async updateWarranty(id: string, updateData: Partial<InsertWarranty>): Promise<Warranty | undefined> {
    const warranty = this.warranties.get(id);
    if (!warranty) return undefined;
    
    const updatedWarranty: Warranty = {
      ...warranty,
      ...updateData,
      updatedAt: new Date()
    };
    this.warranties.set(id, updatedWarranty);
    return updatedWarranty;
  }

  async getAllWarranties(): Promise<Warranty[]> {
    return Array.from(this.warranties.values());
  }

  async getWarrantiesByCustomer(customerId: string): Promise<Warranty[]> {
    return Array.from(this.warranties.values()).filter(warranty => warranty.customerId === customerId);
  }

  async getWarrantiesByStatus(status: string): Promise<Warranty[]> {
    return Array.from(this.warranties.values()).filter(warranty => warranty.status === status);
  }

  async getActiveWarranties(): Promise<Warranty[]> {
    const now = new Date();
    return Array.from(this.warranties.values()).filter(warranty => 
      warranty.status === "active" && warranty.warrantyEndDate > now
    );
  }

  // Vendor methods
  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const vendor: Vendor = {
      ...insertVendor,
      id,
      address: insertVendor.address || null,
      paymentTerms: insertVendor.paymentTerms || null,
      contactEmail: insertVendor.contactEmail || null,
      contactPhone: insertVendor.contactPhone || null,
      isAuthorizedDealer: insertVendor.isAuthorizedDealer || null,
      isActive: insertVendor.isActive !== undefined ? insertVendor.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: string, updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor: Vendor = {
      ...vendor,
      ...updateData,
      updatedAt: new Date()
    };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getActiveVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(vendor => vendor.isActive);
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    monthlyRevenue: number;
    activeOrders: number;
    lowStockItems: number;
    warrantyClaimsCount: number;
  }> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // Calculate monthly revenue from orders this month
    const monthlyOrders = Array.from(this.orders.values()).filter(order => 
      order.createdAt >= currentMonth && 
      (order.status === "delivered" || order.status === "shipped")
    );
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    // Count active orders
    const activeOrders = Array.from(this.orders.values()).filter(order => 
      order.status === "pending" || order.status === "confirmed" || order.status === "processing"
    ).length;

    // Count low stock items
    const lowStockItems = (await this.getLowStockItems(10)).length;

    // Count warranty claims this month
    const warrantyClaimsCount = Array.from(this.warranties.values()).filter(warranty => 
      warranty.claimDate && warranty.claimDate >= currentMonth
    ).length;

    return {
      monthlyRevenue,
      activeOrders,
      lowStockItems,
      warrantyClaimsCount
    };
  }
}

import { DatabaseStorage, createDatabaseStorage } from "./database-storage";

// Use database storage instead of memory storage
export let storage: IStorage;

// Initialize storage with database connection
(async () => {
  try {
    console.log("Attempting to initialize database storage...");
    storage = await createDatabaseStorage();
    console.log("Database storage initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database storage, falling back to memory storage:", error);
    console.log("Initializing memory storage as fallback...");
    storage = new MemStorage();
    console.log("Memory storage initialized successfully");
  }
})();
