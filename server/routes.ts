import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCustomerSchema,
  insertCategorySchema,
  insertProductSchema,
  insertSupplierSchema,
  insertProductVariantSchema,
  insertProductRatingSchema,
  insertProductReviewSchema,
  insertInventorySchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertWarrantySchema,
  insertVendorSchema,
  loginSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware for authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Role-based access control
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", authenticateToken, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/recent-orders", authenticateToken, async (req, res) => {
    try {
      const orders = await storage.getRecentOrders(10);
      const ordersWithCustomers = await Promise.all(
        orders.map(async (order) => {
          const customer = await storage.getCustomer(order.customerId);
          return { ...order, customer };
        })
      );
      res.json(ordersWithCustomers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  // User management routes
  app.get("/api/users", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({ ...userData, password: hashedPassword });
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Customer routes
  app.get("/api/customers", authenticateToken, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", authenticateToken, requireRole(['super_admin', 'operations_manager', 'sales_representative']), async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.get("/api/customers/:id", authenticateToken, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  // Category routes with performance optimizations
  app.get("/api/categories", authenticateToken, async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const includeProductCount = req.query.includeProductCount === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let categories;
      if (includeProductCount) {
        categories = await storage.getCategoriesWithProductCount(activeOnly, limit);
      } else if (activeOnly) {
        categories = await storage.getActiveCategories();
      } else {
        categories = await storage.getAllCategories();
      }
      
      // Set cache headers for better performance
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get minimal categories for dropdowns and forms
  app.get("/api/categories/minimal", authenticateToken, async (req, res) => {
    try {
      const categories = await storage.getCategoriesMinimal();
      
      // Longer cache for minimal data
      res.set('Cache-Control', 'public, max-age=900'); // 15 minutes
      res.json(categories);
    } catch (error) {
      console.error('Error fetching minimal categories:', error);
      res.status(500).json({ message: "Failed to fetch minimal categories" });
    }
  });

  app.get("/api/categories/check-slug", authenticateToken, async (req, res) => {
    try {
      const { slug } = req.query;
      if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ message: "Slug is required" });
      }
      const exists = await storage.checkSlugExists(slug);
      res.json({ available: !exists, exists });
    } catch (error) {
      res.status(500).json({ message: "Failed to check slug" });
    }
  });

  app.post("/api/categories", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Category creation error:', error);
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.get("/api/categories/:id", authenticateToken, async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get product count for a category
  app.get("/api/categories/:id/product-count", authenticateToken, async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.id);
      res.json({ count: products.length });
    } catch (error) {
      console.error('Product count fetch error:', error);
      res.status(500).json({ message: "Failed to fetch product count" });
    }
  });

  app.put("/api/categories/:id", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error('Category update error:', error);
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      console.log('DELETE /api/categories/:id called with ID:', req.params.id);
      const deleted = await storage.deleteCategory(req.params.id);
      console.log('Delete result:', deleted);
      if (!deleted) {
        console.log('Category not found for deletion');
        return res.status(404).json({ message: "Category not found" });
      }
      console.log('Category deleted successfully, sending 204');
      res.status(204).send();
    } catch (error) {
      console.error('Category deletion error:', error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Product routes
  app.get("/api/products", authenticateToken, async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/check-sku", authenticateToken, async (req, res) => {
    try {
      const { sku } = req.query;
      if (!sku || typeof sku !== 'string') {
        return res.status(400).json({ message: "SKU is required" });
      }
      const exists = await storage.checkSkuExists(sku);
      res.json({ available: !exists, exists });
    } catch (error) {
      res.status(500).json({ message: "Failed to check SKU" });
    }
  });

  app.post("/api/products", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.get("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", authenticateToken, requireRole(['super_admin', 'operations_manager', 'warehouse_manager']), async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      const inventoryWithProducts = await Promise.all(
        inventory.map(async (inv) => {
          const product = await storage.getProduct(inv.productId);
          return { ...inv, product };
        })
      );
      res.json(inventoryWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", authenticateToken, async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      const itemsWithProducts = await Promise.all(
        lowStockItems.map(async (inv) => {
          const product = await storage.getProduct(inv.productId);
          return { ...inv, product };
        })
      );
      res.json(itemsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.post("/api/inventory", authenticateToken, requireRole(['super_admin', 'warehouse_manager']), async (req, res) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      const inventory = await storage.createInventory(inventoryData);
      res.status(201).json(inventory);
    } catch (error) {
      res.status(400).json({ message: "Invalid inventory data" });
    }
  });

  // Order routes
  app.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      const { status, customerId } = req.query;
      
      let orders;
      if (status) {
        orders = await storage.getOrdersByStatus(status as string);
      } else if (customerId) {
        orders = await storage.getOrdersByCustomer(customerId as string);
      } else {
        orders = await storage.getAllOrders();
      }
      
      const ordersWithCustomers = await Promise.all(
        orders.map(async (order) => {
          const customer = await storage.getCustomer(order.customerId);
          return { ...order, customer };
        })
      );
      
      res.json(ordersWithCustomers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const customer = await storage.getCustomer(order.customerId);
      const orderItems = await storage.getOrderItems(order.id);
      
      res.json({ ...order, customer, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Warranty routes
  app.get("/api/warranties", authenticateToken, async (req, res) => {
    try {
      const { status, customerId } = req.query;
      
      let warranties;
      if (status) {
        warranties = await storage.getWarrantiesByStatus(status as string);
      } else if (customerId) {
        warranties = await storage.getWarrantiesByCustomer(customerId as string);
      } else {
        warranties = await storage.getAllWarranties();
      }
      
      const warrantiesWithDetails = await Promise.all(
        warranties.map(async (warranty) => {
          const product = await storage.getProduct(warranty.productId);
          const customer = await storage.getCustomer(warranty.customerId);
          return { ...warranty, product, customer };
        })
      );
      
      res.json(warrantiesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warranties" });
    }
  });

  app.post("/api/warranties", authenticateToken, requireRole(['super_admin', 'customer_service', 'technical_support']), async (req, res) => {
    try {
      const warrantyData = insertWarrantySchema.parse(req.body);
      const warranty = await storage.createWarranty(warrantyData);
      res.status(201).json(warranty);
    } catch (error) {
      res.status(400).json({ message: "Invalid warranty data" });
    }
  });

  app.patch("/api/warranties/:id", authenticateToken, requireRole(['super_admin', 'customer_service', 'technical_support']), async (req, res) => {
    try {
      const updateData = req.body;
      const warranty = await storage.updateWarranty(req.params.id, updateData);
      if (!warranty) {
        return res.status(404).json({ message: "Warranty not found" });
      }
      res.json(warranty);
    } catch (error) {
      res.status(500).json({ message: "Failed to update warranty" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", authenticateToken, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.get("/api/suppliers/:id", authenticateToken, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.put("/api/suppliers/:id", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, supplierData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.delete("/api/suppliers/:id", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Product Variant routes
  app.get("/api/products/:productId/variants", authenticateToken, async (req, res) => {
    try {
      const variants = await storage.getProductVariantsByProduct(req.params.productId);
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product variants" });
    }
  });

  app.post("/api/products/:productId/variants", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const variantData = insertProductVariantSchema.parse({
        ...req.body,
        productId: req.params.productId
      });
      const variant = await storage.createProductVariant(variantData);
      res.status(201).json(variant);
    } catch (error) {
      res.status(400).json({ message: "Invalid variant data" });
    }
  });

  app.put("/api/product-variants/:id", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const variantData = insertProductVariantSchema.parse(req.body);
      const variant = await storage.updateProductVariant(req.params.id, variantData);
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      res.json(variant);
    } catch (error) {
      res.status(400).json({ message: "Invalid variant data" });
    }
  });

  app.delete("/api/product-variants/:id", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const deleted = await storage.deleteProductVariant(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      res.json({ message: "Product variant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product variant" });
    }
  });

  // Product Rating routes
  app.get("/api/products/:productId/ratings", authenticateToken, async (req, res) => {
    try {
      const ratings = await storage.getProductRatingsByProduct(req.params.productId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product ratings" });
    }
  });

  app.post("/api/products/:productId/ratings", authenticateToken, async (req, res) => {
    try {
      const ratingData = insertProductRatingSchema.parse({
        ...req.body,
        productId: req.params.productId
      });
      
      // Typically you'd get customerId from the authenticated user
      if (!ratingData.customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }
      
      const rating = await storage.createProductRating(ratingData);
      res.status(201).json(rating);
    } catch (error) {
      res.status(400).json({ message: "Invalid rating data" });
    }
  });

  // Product Review routes
  app.get("/api/products/:productId/reviews", authenticateToken, async (req, res) => {
    try {
      const reviews = await storage.getProductReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product reviews" });
    }
  });

  app.post("/api/products/:productId/reviews", authenticateToken, async (req, res) => {
    try {
      const reviewData = insertProductReviewSchema.parse({
        ...req.body,
        productId: req.params.productId
      });
      
      // Typically you'd get customerId from the authenticated user
      if (!reviewData.customerId) {
        return res.status(400).json({ message: "Customer ID is required" });
      }
      
      const review = await storage.createProductReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.put("/api/product-reviews/:id", authenticateToken, async (req, res) => {
    try {
      const reviewData = insertProductReviewSchema.parse(req.body);
      const review = await storage.updateProductReview(req.params.id, reviewData);
      if (!review) {
        return res.status(404).json({ message: "Product review not found" });
      }
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.delete("/api/product-reviews/:id", authenticateToken, async (req, res) => {
    try {
      const deleted = await storage.deleteProductReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product review not found" });
      }
      res.json({ message: "Product review deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product review" });
    }
  });

  // Vendor routes
  app.get("/api/vendors", authenticateToken, async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post("/api/vendors", authenticateToken, requireRole(['super_admin', 'operations_manager']), async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      res.status(400).json({ message: "Invalid vendor data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
