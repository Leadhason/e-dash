import { 
  type User, 
  type InsertUser, 
  type Customer, 
  type InsertCustomer,
  type Product, 
  type InsertProduct,
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
  users,
  customers, 
  products,
  inventory,
  orders,
  orderItems,
  warranties,
  vendors
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, like, sql, and, gte, lte, ilike, inArray } from "drizzle-orm";
import { IStorage } from "./storage";
import bcrypt from "bcryptjs";

// Database connection
const queryClient = postgres(process.env.DATABASE_URL!, {
  max: 1
});
const db = drizzle(queryClient);

export class DatabaseStorage implements IStorage {
  
  // Initialize with default admin user
  async initializeDefaultData() {
    try {
      // Check if admin user already exists
      const existingAdmin = await db
        .select()
        .from(users)
        .where(eq(users.username, "admin"))
        .limit(1);

      if (existingAdmin.length === 0) {
        // Create admin user if doesn't exist
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await db.insert(users).values({
          username: "admin",
          email: "admin@toolstech.com",
          password: hashedPassword,
          firstName: "Sarah",
          lastName: "Johnson",
          role: "super_admin",
          isActive: true
        });
      }
    } catch (error) {
      console.error("Failed to initialize default data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    return result[0];
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(insertCustomer).returning();
    return result[0];
  }

  async updateCustomer(id: string, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(updateData).where(eq(customers.id, id)).returning();
    return result[0];
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomersByType(type: string): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.customerType, type as any));
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
    return result[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return result[0];
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category as any));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    return await db.select().from(products).where(
      sql`LOWER(${products.name}) LIKE ${lowerQuery} OR LOWER(${products.sku}) LIKE ${lowerQuery} OR LOWER(${products.brand}) LIKE ${lowerQuery}`
    );
  }

  // Inventory methods
  async getInventory(productId: string, location?: string): Promise<Inventory[]> {
    const conditions = [eq(inventory.productId, productId)];
    if (location) {
      conditions.push(eq(inventory.location, location));
    }
    return await db.select().from(inventory).where(and(...conditions));
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values(insertInventory).returning();
    return result[0];
  }

  async updateInventory(id: string, updateData: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const result = await db.update(inventory).set(updateData).where(eq(inventory.id, id)).returning();
    return result[0];
  }

  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async getLowStockItems(threshold: number = 10): Promise<Inventory[]> {
    return await db.select().from(inventory).where(lte(inventory.quantityAvailable, threshold));
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return result[0];
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async updateOrder(id: string, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(orders).set(updateData).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId));
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.status, status as any));
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return await db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`).limit(limit);
  }

  // Order Item methods
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(insertOrderItem).returning();
    return result[0];
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Warranty methods
  async getWarranty(id: string): Promise<Warranty | undefined> {
    const result = await db.select().from(warranties).where(eq(warranties.id, id)).limit(1);
    return result[0];
  }

  async createWarranty(insertWarranty: InsertWarranty): Promise<Warranty> {
    const result = await db.insert(warranties).values(insertWarranty).returning();
    return result[0];
  }

  async updateWarranty(id: string, updateData: Partial<InsertWarranty>): Promise<Warranty | undefined> {
    const result = await db.update(warranties).set(updateData).where(eq(warranties.id, id)).returning();
    return result[0];
  }

  async getAllWarranties(): Promise<Warranty[]> {
    return await db.select().from(warranties);
  }

  async getWarrantiesByCustomer(customerId: string): Promise<Warranty[]> {
    return await db.select().from(warranties).where(eq(warranties.customerId, customerId));
  }

  async getWarrantiesByStatus(status: string): Promise<Warranty[]> {
    return await db.select().from(warranties).where(eq(warranties.status, status as any));
  }

  async getActiveWarranties(): Promise<Warranty[]> {
    const now = new Date();
    return await db.select().from(warranties).where(
      and(
        eq(warranties.status, "active"),
        gte(warranties.warrantyEndDate, now)
      )
    );
  }

  // Vendor methods
  async getVendor(id: string): Promise<Vendor | undefined> {
    const result = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
    return result[0];
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const result = await db.insert(vendors).values(insertVendor).returning();
    return result[0];
  }

  async updateVendor(id: string, updateData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const result = await db.update(vendors).set(updateData).where(eq(vendors.id, id)).returning();
    return result[0];
  }

  async getAllVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getActiveVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.isActive, true));
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
    const monthlyOrdersResult = await db.select({
      totalAmount: orders.totalAmount
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, currentMonth),
        inArray(orders.status, ["delivered", "shipped"])
      )
    );

    const monthlyRevenue = monthlyOrdersResult.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount), 
      0
    );

    // Count active orders
    const activeOrdersResult = await db.select({
      count: sql<number>`count(*)`
    })
    .from(orders)
    .where(
      inArray(orders.status, ["pending", "confirmed", "processing"])
    );

    const activeOrders = Number(activeOrdersResult[0]?.count || 0);

    // Count low stock items
    const lowStockResult = await db.select({
      count: sql<number>`count(*)`
    })
    .from(inventory)
    .where(lte(inventory.quantityAvailable, 10));

    const lowStockItems = Number(lowStockResult[0]?.count || 0);

    // Count warranty claims this month
    const warrantyClaimsResult = await db.select({
      count: sql<number>`count(*)`
    })
    .from(warranties)
    .where(
      and(
        gte(warranties.claimDate, currentMonth),
        sql`${warranties.claimDate} IS NOT NULL`
      )
    );

    const warrantyClaimsCount = Number(warrantyClaimsResult[0]?.count || 0);

    return {
      monthlyRevenue,
      activeOrders,
      lowStockItems,
      warrantyClaimsCount
    };
  }
}

// Create the database storage instance and initialize it
export const createDatabaseStorage = async (): Promise<DatabaseStorage> => {
  const storage = new DatabaseStorage();
  await storage.initializeDefaultData();
  return storage;
};