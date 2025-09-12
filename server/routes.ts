import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCustomerSchema, 
  insertProductSchema,
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
          role: user.role
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

  app.post("/api/products", authenticateToken, requireRole(['super_admin', 'product_manager']), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
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
