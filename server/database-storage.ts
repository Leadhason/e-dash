import { config } from 'dotenv';
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
import { eq, like, sql, and, gte, lte, ilike, inArray } from "drizzle-orm";
import { IStorage } from "./storage";
import bcrypt from "bcryptjs";

// Load environment variables from .env.local
config({ path: '.env.local' });

// Database connection
console.log('DATABASE_URL loaded in database-storage:', !!process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const queryClient = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  idle_timeout: 20,
  connect_timeout: 60, // Increased for serverless databases
  prepare: false, // Disable prepared statements for better compatibility
  transform: {
    undefined: null,
  },
  connection: {
    parseInputDatesAsUTC: true,
    application_name: 'e-dash'
  },
  onnotice: () => {}, // Suppress notices
  debug: false // Disable debug logging
});
const db = drizzle(queryClient);

export { db };

export class DatabaseStorage implements IStorage {
  
  // Initialize with default admin user
  async initializeDefaultData() {
    try {
      // Test database connection first
      await db.execute(sql`SELECT 1`);
      
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
        console.log("Default admin user created successfully");
      } else {
        console.log("Admin user already exists, skipping initialization");
      }
    } catch (error) {
      console.error("Failed to initialize default data:", error);
      // Don't throw the error, just log it so the app can continue without database
      console.log("Continuing without database initialization...");
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

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(insertCategory).returning();
    return result[0];
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await db
      .update(categories)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      // First, we need to remove this category from all products' categoryIds arrays
      // or delete products if this is their only category
      const productsWithCategory = await db
        .select()
        .from(products)
        .where(sql`${products.categoryIds} ? ${id}`);
      
      for (const product of productsWithCategory) {
        const categoryIds = (product.categoryIds as string[]).filter(catId => catId !== id);
        if (categoryIds.length === 0) {
          // Delete product if no categories left
          await db.delete(products).where(eq(products.id, product.id));
        } else {
          // Update product to remove this category
          await db
            .update(products)
            .set({ categoryIds: categoryIds as any, updatedAt: new Date() })
            .where(eq(products.id, product.id));
        }
      }
      
      // Then delete the category
      const result = await db.delete(categories).where(eq(categories.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.sortOrder);
  }

  async getActiveCategories(): Promise<Category[]> {
    return await db.select().from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder);
  }

  async checkSlugExists(slug: string): Promise<boolean> {
    try {
      const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking slug existence:', error);
      return false;
    }
  }

  async getCategoriesWithProductCount(activeOnly = false, limit?: number): Promise<(Category & { productCount: number })[]> {
    try {
      // Build the complete query based on conditions
      let categoriesData;
      
      if (activeOnly && limit) {
        categoriesData = await db.select().from(categories)
          .where(eq(categories.isActive, true))
          .orderBy(categories.sortOrder, categories.name)
          .limit(limit);
      } else if (activeOnly) {
        categoriesData = await db.select().from(categories)
          .where(eq(categories.isActive, true))
          .orderBy(categories.sortOrder, categories.name);
      } else if (limit) {
        categoriesData = await db.select().from(categories)
          .orderBy(categories.sortOrder, categories.name)
          .limit(limit);
      } else {
        categoriesData = await db.select().from(categories)
          .orderBy(categories.sortOrder, categories.name);
      }
      
      // For each category, count products that include this category in their categoryIds array
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (cat) => {
          const countResult = await db
            .select({
              count: sql<number>`count(*)::int`
            })
            .from(products)
            .where(
              and(
                eq(products.isActive, true),
                sql`${products.categoryIds}::jsonb ? ${cat.id}::text` // JSONB contains operator with proper casting
              )
            );
          
          return {
            ...cat,
            productCount: countResult[0]?.count || 0
          };
        })
      );
      
      return categoriesWithCounts;
    } catch (error) {
      console.error('Error fetching categories with product count:', error);
      throw error;
    }
  }

  async getCategoriesMinimal(): Promise<{ id: string; name: string; slug: string }[]> {
    try {
      return await db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug
        })
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(categories.sortOrder, categories.name);
    } catch (error) {
      console.error('Error fetching minimal categories:', error);
      throw error;
    }
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

  async checkSkuExists(sku: string): Promise<boolean> {
    try {
      const result = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking SKU existence:', error);
      return false;
    }
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(sql`${products.categoryIds} ? ${category}`);
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

  // Supplier methods
  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplierData: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db.insert(suppliers).values(supplierData).returning();
    return supplier;
  }

  async updateSupplier(id: string, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [supplier] = await db.update(suppliers)
      .set({ ...supplierData, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return result.length > 0;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  }

  // Product Variant methods
  async getProductVariant(id: string): Promise<ProductVariant | undefined> {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.id, id));
    return variant;
  }

  async getProductVariantsBySku(sku: string): Promise<ProductVariant | undefined> {
    const [variant] = await db.select().from(productVariants).where(eq(productVariants.sku, sku));
    return variant;
  }

  async createProductVariant(variantData: InsertProductVariant): Promise<ProductVariant> {
    const [variant] = await db.insert(productVariants).values(variantData).returning();
    return variant;
  }

  async updateProductVariant(id: string, variantData: Partial<InsertProductVariant>): Promise<ProductVariant | undefined> {
    const [variant] = await db.update(productVariants)
      .set({ ...variantData, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(productVariants.id, id))
      .returning();
    return variant;
  }

  async deleteProductVariant(id: string): Promise<boolean> {
    const result = await db.delete(productVariants).where(eq(productVariants.id, id)).returning();
    return result.length > 0;
  }

  async getProductVariantsByProduct(productId: string): Promise<ProductVariant[]> {
    return await db.select().from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.createdAt);
  }

  // Product Rating methods
  async getProductRating(id: string): Promise<ProductRating | undefined> {
    const [rating] = await db.select().from(productRatings).where(eq(productRatings.id, id));
    return rating;
  }

  async createProductRating(ratingData: InsertProductRating): Promise<ProductRating> {
    const [rating] = await db.insert(productRatings).values(ratingData).returning();
    return rating;
  }

  async getProductRatingsByProduct(productId: string): Promise<ProductRating[]> {
    return await db.select().from(productRatings)
      .where(eq(productRatings.productId, productId))
      .orderBy(productRatings.createdAt);
  }

  async getProductRatingsByCustomer(customerId: string): Promise<ProductRating[]> {
    return await db.select().from(productRatings)
      .where(eq(productRatings.customerId, customerId))
      .orderBy(productRatings.createdAt);
  }

  // Product Review methods
  async getProductReview(id: string): Promise<ProductReview | undefined> {
    const [review] = await db.select().from(productReviews).where(eq(productReviews.id, id));
    return review;
  }

  async createProductReview(reviewData: InsertProductReview): Promise<ProductReview> {
    const [review] = await db.insert(productReviews).values(reviewData).returning();
    return review;
  }

  async updateProductReview(id: string, reviewData: Partial<InsertProductReview>): Promise<ProductReview | undefined> {
    const [review] = await db.update(productReviews)
      .set({ ...reviewData, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(productReviews.id, id))
      .returning();
    return review;
  }

  async deleteProductReview(id: string): Promise<boolean> {
    const result = await db.delete(productReviews).where(eq(productReviews.id, id)).returning();
    return result.length > 0;
  }

  async getProductReviewsByProduct(productId: string): Promise<ProductReview[]> {
    return await db.select().from(productReviews)
      .where(eq(productReviews.productId, productId))
      .orderBy(productReviews.createdAt);
  }

  async getProductReviewsByCustomer(customerId: string): Promise<ProductReview[]> {
    return await db.select().from(productReviews)
      .where(eq(productReviews.customerId, customerId))
      .orderBy(productReviews.createdAt);
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