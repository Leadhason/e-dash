import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "operations_manager", 
  "product_manager",
  "customer_service",
  "sales_representative",
  "warehouse_manager",
  "technical_support"
]);



export const orderTypeEnum = pgEnum("order_type", [
  "retail",
  "bulk",
  "emergency",
  "warranty",
  "recurring"
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
]);

export const warrantyStatusEnum = pgEnum("warranty_status", [
  "active",
  "expired",
  "claimed",
  "voided"
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("customer_service"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Customer table - simplified for e-commerce store
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  customerType: varchar("customer_type", { length: 50 }).notNull().default("regular"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Suppliers table - Direct product manufacturers/suppliers for inventory management
// Used for tracking where products come from and restocking purposes
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Products table (updated structure)
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  detailedSpecifications: text("detailed_specifications").notNull(),
  categoryIds: jsonb("category_ids").$type<string[]>().notNull(), // Array of category UUIDs
  brand: varchar("brand", { length: 100 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // For discounted items
  discountPercentage: integer("discount_percentage"), // 0-100
  weight: decimal("weight", { precision: 8, scale: 3 }), // kg or lbs
  dimensions: jsonb("dimensions").$type<{
    length: number;
    width: number;
    height: number;
    unit: string;
  }>(),
  images: jsonb("images").$type<string[]>().notNull().default(sql`'[]'::jsonb`), // Exactly 4 images
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  isActive: boolean("is_active").notNull().default(true),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`), // new, popular, etc.
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Product Variants table
export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  attributes: jsonb("attributes").$type<Array<{
    type: string;
    value: string;
  }>>().notNull(), // [{type: "color", value: "red"}, {type: "size", value: "large"}]
  stockQuantity: integer("stock_quantity").notNull().default(0),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).default("0.00"), // Price difference from base product
  images: jsonb("images").$type<string[]>().default(sql`'[]'::jsonb`), // Variant-specific images
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Product Ratings table
export const productRatings = pgTable("product_ratings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 scale
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Product Reviews table
export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 scale
  reviewText: text("review_text").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  location: varchar("location", { length: 100 }).notNull(), // Warehouse, store location
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  quantityReserved: integer("quantity_reserved").notNull().default(0),
  quantityAvailable: integer("quantity_available").notNull().default(0),
  reorderPoint: integer("reorder_point").default(10),
  maxStock: integer("max_stock"),
  lastStockCheck: timestamp("last_stock_check"),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  orderType: orderTypeEnum("order_type").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  shippingAddress: jsonb("shipping_address"),
  billingAddress: jsonb("billing_address"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Order Items table
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Warranties table
export const warranties = pgTable("warranties", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  orderId: uuid("order_id").references(() => orders.id),
  serialNumber: varchar("serial_number", { length: 100 }),
  purchaseDate: timestamp("purchase_date").notNull(),
  warrantyStartDate: timestamp("warranty_start_date").notNull(),
  warrantyEndDate: timestamp("warranty_end_date").notNull(),
  status: warrantyStatusEnum("status").notNull().default("active"),
  claimDate: timestamp("claim_date"),
  claimReason: text("claim_reason"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Vendors table - Business partners and resellers for sales/distribution
// Used for managing authorized dealers, payment terms, and partnership agreements
export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: jsonb("address"),
  isAuthorizedDealer: boolean("is_authorized_dealer").default(false),
  paymentTerms: integer("payment_terms"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProductSchema = z.object({
  sku: z.string()
    .min(1, "SKU is required")
    .max(100, "SKU must be less than 100 characters"),
  name: z.string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters"),
  description: z.string().min(1, "Description is required"),
  detailedSpecifications: z.string().min(1, "Detailed specifications are required"),
  categoryIds: z.array(z.string().uuid()).min(1, "At least one category is required"),
  brand: z.string().min(1, "Brand is required"),
  costPrice: z.number().positive("Cost price is required").transform((val) => val.toString()),
  sellingPrice: z.number().positive("Selling price is required").transform((val) => val.toString()),
  discountPercentage: z.number().min(0).max(100).optional(),
  weight: z.number().positive().optional().transform((val) => val !== undefined ? val.toString() : undefined),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(["cm", "in"])
  }).optional(),
  images: z.array(z.string()).max(4, "Maximum 4 images allowed").default([]),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative").default(0),
  lowStockThreshold: z.number().min(0, "Low stock threshold cannot be negative").default(10),
  isActive: z.boolean().default(true),
  supplierId: z.string().uuid().optional(),
  tags: z.array(z.string()).default([])
});

export const insertProductVariantSchema = z.object({
  productId: z.string().uuid("Product ID must be a valid UUID"),
  sku: z.string().min(1, "SKU is required").max(100, "SKU must be less than 100 characters"),
  attributes: z.array(z.object({
    type: z.string().min(1, "Attribute type is required"),
    value: z.string().min(1, "Attribute value is required")
  })).min(1, "At least one attribute is required"),
  stockQuantity: z.number().min(0, "Stock quantity cannot be negative").default(0),
  additionalPrice: z.number().optional().transform((val) => val !== undefined ? val.toString() : "0.00"),
  images: z.array(z.string()).default([])
});

export const insertProductRatingSchema = createInsertSchema(productRatings).omit({
  id: true,
  createdAt: true
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true
});

export const insertWarrantySchema = createInsertSchema(warranties).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductRating = z.infer<typeof insertProductRatingSchema>;
export type ProductRating = typeof productRatings.$inferSelect;
export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertWarranty = z.infer<typeof insertWarrantySchema>;
export type Warranty = typeof warranties.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

// User roles type
export type UserRole = "super_admin" | "operations_manager" | "product_manager" | "customer_service" | "sales_representative" | "warehouse_manager" | "technical_support";
