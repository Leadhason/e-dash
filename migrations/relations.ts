import { relations } from "drizzle-orm/relations";
import { customers, orders, products, inventory, orderItems, warranties, suppliers, productRatings, productReviews, productVariants } from "./schema";

export const ordersRelations = relations(orders, ({one, many}) => ({
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.id]
	}),
	orderItems: many(orderItems),
	warranties: many(warranties),
}));

export const customersRelations = relations(customers, ({many}) => ({
	orders: many(orders),
	warranties: many(warranties),
	productRatings: many(productRatings),
	productReviews: many(productReviews),
}));

export const inventoryRelations = relations(inventory, ({one}) => ({
	product: one(products, {
		fields: [inventory.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	inventories: many(inventory),
	orderItems: many(orderItems),
	warranties: many(warranties),
	supplier: one(suppliers, {
		fields: [products.supplierId],
		references: [suppliers.id]
	}),
	productRatings: many(productRatings),
	productReviews: many(productReviews),
	productVariants: many(productVariants),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const warrantiesRelations = relations(warranties, ({one}) => ({
	product: one(products, {
		fields: [warranties.productId],
		references: [products.id]
	}),
	customer: one(customers, {
		fields: [warranties.customerId],
		references: [customers.id]
	}),
	order: one(orders, {
		fields: [warranties.orderId],
		references: [orders.id]
	}),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	products: many(products),
}));

export const productRatingsRelations = relations(productRatings, ({one}) => ({
	product: one(products, {
		fields: [productRatings.productId],
		references: [products.id]
	}),
	customer: one(customers, {
		fields: [productRatings.customerId],
		references: [customers.id]
	}),
}));

export const productReviewsRelations = relations(productReviews, ({one}) => ({
	product: one(products, {
		fields: [productReviews.productId],
		references: [products.id]
	}),
	customer: one(customers, {
		fields: [productReviews.customerId],
		references: [customers.id]
	}),
}));

export const productVariantsRelations = relations(productVariants, ({one}) => ({
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
}));