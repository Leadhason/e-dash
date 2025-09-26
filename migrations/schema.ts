import { pgTable, unique, uuid, varchar, text, boolean, timestamp, jsonb, integer, foreignKey, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const orderStatus = pgEnum("order_status", ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
export const orderType = pgEnum("order_type", ['retail', 'bulk', 'emergency', 'warranty', 'recurring'])
export const userRole = pgEnum("user_role", ['super_admin', 'operations_manager', 'product_manager', 'customer_service', 'sales_representative', 'warehouse_manager', 'technical_support'])
export const warrantyStatus = pgEnum("warranty_status", ['active', 'expired', 'claimed', 'voided'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: text().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	role: userRole().default('customer_service').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const vendors = pgTable("vendors", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 50 }),
	address: jsonb(),
	isAuthorizedDealer: boolean("is_authorized_dealer").default(false),
	paymentTerms: integer("payment_terms"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderNumber: varchar("order_number", { length: 50 }).notNull(),
	customerId: uuid("customer_id").notNull(),
	orderType: orderType("order_type").notNull(),
	status: orderStatus().default('pending').notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	taxAmount: numeric("tax_amount", { precision: 10, scale:  2 }),
	shippingAmount: numeric("shipping_amount", { precision: 10, scale:  2 }),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	notes: text(),
	shippingAddress: jsonb("shipping_address"),
	billingAddress: jsonb("billing_address"),
	estimatedDelivery: timestamp("estimated_delivery", { mode: 'string' }),
	actualDelivery: timestamp("actual_delivery", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "orders_customer_id_customers_id_fk"
		}),
	unique("orders_order_number_unique").on(table.orderNumber),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	slug: varchar({ length: 100 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const inventory = pgTable("inventory", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	location: varchar({ length: 100 }).notNull(),
	quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
	quantityReserved: integer("quantity_reserved").default(0).notNull(),
	quantityAvailable: integer("quantity_available").default(0).notNull(),
	reorderPoint: integer("reorder_point").default(10),
	maxStock: integer("max_stock"),
	lastStockCheck: timestamp("last_stock_check", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "inventory_product_id_products_id_fk"
		}),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
]);

export const warranties = pgTable("warranties", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	orderId: uuid("order_id"),
	serialNumber: varchar("serial_number", { length: 100 }),
	purchaseDate: timestamp("purchase_date", { mode: 'string' }).notNull(),
	warrantyStartDate: timestamp("warranty_start_date", { mode: 'string' }).notNull(),
	warrantyEndDate: timestamp("warranty_end_date", { mode: 'string' }).notNull(),
	status: warrantyStatus().default('active').notNull(),
	claimDate: timestamp("claim_date", { mode: 'string' }),
	claimReason: text("claim_reason"),
	resolutionNotes: text("resolution_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "warranties_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "warranties_customer_id_customers_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "warranties_order_id_orders_id_fk"
		}),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sku: varchar({ length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	detailedSpecifications: text("detailed_specifications").notNull(),
	brand: varchar({ length: 100 }).notNull(),
	images: jsonb().default([]).notNull(),
	sellingPrice: numeric("selling_price", { precision: 10, scale:  2 }).notNull(),
	costPrice: numeric("cost_price", { precision: 10, scale:  2 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	categoryIds: jsonb("category_ids").notNull(),
	originalPrice: numeric("original_price", { precision: 10, scale:  2 }),
	discountPercentage: integer("discount_percentage"),
	weight: numeric({ precision: 8, scale:  3 }),
	dimensions: jsonb(),
	stockQuantity: integer("stock_quantity").default(0).notNull(),
	lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),
	supplierId: uuid("supplier_id"),
	tags: jsonb().default([]),
}, (table) => [
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "products_supplier_id_suppliers_id_fk"
		}),
	unique("products_sku_unique").on(table.sku),
]);

export const customers = pgTable("customers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	phone: varchar({ length: 20 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	passwordHash: text("password_hash").notNull(),
}, (table) => [
	unique("customers_email_unique").on(table.email),
]);

export const productRatings = pgTable("product_ratings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	rating: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_ratings_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "product_ratings_customer_id_customers_id_fk"
		}).onDelete("cascade"),
]);

export const productReviews = pgTable("product_reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	customerId: uuid("customer_id").notNull(),
	rating: integer().notNull(),
	reviewText: text("review_text").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_reviews_product_id_products_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.id],
			name: "product_reviews_customer_id_customers_id_fk"
		}).onDelete("cascade"),
]);

export const productVariants = pgTable("product_variants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	sku: varchar({ length: 100 }).notNull(),
	attributes: jsonb().notNull(),
	stockQuantity: integer("stock_quantity").default(0).notNull(),
	additionalPrice: numeric("additional_price", { precision: 10, scale:  2 }).default('0.00'),
	images: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_variants_product_id_products_id_fk"
		}).onDelete("cascade"),
	unique("product_variants_sku_unique").on(table.sku),
]);

export const suppliers = pgTable("suppliers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 50 }),
	address: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
