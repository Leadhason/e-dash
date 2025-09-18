import 'dotenv/config';
import { db } from './database-storage';
import { users, customers, products, inventory, orders, orderItems, warranties, vendors } from '@shared/schema';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Check and create default admin user
  const existingAdmin = await db.select().from(users).limit(1);
  if (existingAdmin.length === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await db.insert(users).values({
    username: 'admin',
    email: 'admin@toolspower.com',
    password: adminPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'super_admin',
    }).returning().execute();
    console.log('✅ Created admin user');
  } else {
    console.log('ℹ️ Admin user already exists, skipping...');
  }

  // Check and create sample customers
  const existingCustomers = await db.select().from(customers).limit(1);
  if (existingCustomers.length === 0) {
  const customerTypes = ['individual', 'professional_contractor', 'industrial_account', 'government_municipal', 'educational_institution'];
  const sampleCustomers = Array.from({ length: 20 }, () => ({
    companyName: faker.company.name(),
    contactFirstName: faker.person.firstName(),
    contactLastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    customerType: faker.helpers.arrayElement(customerTypes),
    taxExempt: faker.datatype.boolean(),
    creditLimit: parseFloat(faker.finance.amount(1000, 50000, 2)),
    paymentTerms: faker.helpers.arrayElement([30, 60, 90]),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'USA'
    }
  }));

    await db.insert(customers).values(sampleCustomers).execute();
    console.log('✅ Created sample customers');
  } else {
    console.log('ℹ️ Customers already exist, skipping...');
  }

  // Check and create sample products
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length === 0) {
  const categories = ['power_tools', 'hand_tools', 'safety_equipment', 'accessories', 'replacement_parts'];
  const brands = ['DeWalt', 'Milwaukee', 'Makita', 'Bosch', 'Stanley', 'Klein Tools', '3M', 'Craftsman'];
  
  const sampleProducts = Array.from({ length: 50 }, () => {
    const name = `${faker.helpers.arrayElement(brands)} ${faker.commerce.productName()}`;
    return {
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name,
      description: faker.commerce.productDescription(),
      category: faker.helpers.arrayElement(categories),
      brand: faker.helpers.arrayElement(brands),
      price: parseFloat(faker.commerce.price({ min: 20, max: 2000 })),
      costPrice: parseFloat(faker.commerce.price({ min: 10, max: 1500 })),
      weight: parseFloat(faker.number.float({ min: 0.1, max: 50, precision: 0.1 })),
      dimensions: {
        length: parseFloat(faker.number.float({ min: 5, max: 100 })),
        width: parseFloat(faker.number.float({ min: 5, max: 100 })),
        height: parseFloat(faker.number.float({ min: 5, max: 100 }))
      },
      technicalSpecs: {
        power: faker.helpers.arrayElement(['Cordless', 'Corded', 'Manual']),
        voltage: faker.helpers.arrayElement(['18V', '20V', '12V', 'N/A']),
        material: faker.helpers.arrayElement(['Steel', 'Aluminum', 'Plastic', 'Carbon Fiber'])
      },
      safetyCompliance: {
        certifications: ['UL', 'CE'].filter(() => faker.datatype.boolean()),
        standards: ['OSHA', 'ANSI'].filter(() => faker.datatype.boolean())
      },
      warrantyMonths: faker.helpers.arrayElement([12, 24, 36, 60]),
      isActive: true,
      isSeasonal: faker.datatype.boolean(),
    };
  });

    await db.insert(products).values(sampleProducts).execute();
    console.log('✅ Created sample products');
  } else {
    console.log('ℹ️ Products already exist, skipping...');
  }

  // Get reference IDs for relationships
  const productIds = (await db.select({ id: products.id }).from(products)).map(p => p.id);
  const customerIds = (await db.select({ id: customers.id }).from(customers)).map(c => c.id);
  const orderIds = (await db.select({ id: orders.id }).from(orders)).map(o => o.id);
  
  // Check and create inventory records
  const existingInventory = await db.select().from(inventory).limit(1);
  if (existingInventory.length === 0) {
  const sampleInventory = productIds.map(productId => {
    const quantityOnHand = faker.number.int({ min: 0, max: 200 });
    const quantityReserved = faker.number.int({ min: 0, max: Math.min(quantityOnHand, 50) });
    return {
      productId,
      location: faker.helpers.arrayElement(['A', 'B', 'C']) + faker.number.int({ min: 1, max: 9 }) + '-' + faker.number.int({ min: 1, max: 20 }),
      quantityOnHand,
      quantityReserved,
      quantityAvailable: quantityOnHand - quantityReserved,
      reorderPoint: faker.number.int({ min: 10, max: 50 }),
      maxStock: faker.number.int({ min: 200, max: 300 }),
      lastStockCheck: faker.date.recent({ days: 30 })
    };
  });

    await db.insert(inventory).values(sampleInventory).execute();
    console.log('✅ Created inventory records');
  } else {
    console.log('ℹ️ Inventory records already exist, skipping...');
  }

  // Check and create sample vendors
  const existingVendors = await db.select().from(vendors).limit(1);
  if (existingVendors.length === 0) {
  const sampleVendors = Array.from({ length: 10 }, () => ({
    name: faker.company.name(),
    contactEmail: faker.internet.email(),
    contactPhone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'USA'
    },
    paymentTerms: faker.helpers.arrayElement([15, 30, 45, 60]),
    isAuthorizedDealer: faker.datatype.boolean(),
    isActive: true
  }));

    await db.insert(vendors).values(sampleVendors).execute();
    console.log('✅ Created sample vendors');
  } else {
    console.log('ℹ️ Vendors already exist, skipping...');
  }

  // Check and create sample orders
  const existingOrders = await db.select().from(orders).limit(1);
  if (existingOrders.length === 0) {
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  const orderTypes = ['retail', 'bulk', 'emergency', 'warranty', 'recurring'];

  const sampleOrders = Array.from({ length: 100 }, () => {
    const subtotal = parseFloat(faker.commerce.price({ min: 100, max: 5000 }));
    const taxRate = 0.08; // 8% tax
    const shippingAmount = parseFloat(faker.commerce.price({ min: 10, max: 100 }));
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount + shippingAmount;

    return {
      orderNumber: faker.string.alphanumeric(10).toUpperCase(),
      customerId: faker.helpers.arrayElement(customerIds),
      orderType: faker.helpers.arrayElement(orderTypes),
      status: faker.helpers.arrayElement(orderStatuses),
      subtotal,
      taxAmount,
      shippingAmount,
      totalAmount,
      notes: faker.lorem.sentence(),
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: 'USA'
      },
      billingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: 'USA'
      },
      estimatedDelivery: faker.date.future({ days: 14 }),
      actualDelivery: faker.helpers.maybe(() => faker.date.future({ days: 7 }))
    };
  });

  await db.insert(orders).values(sampleOrders).execute();
  console.log('✅ Created sample orders');

  // Create order items
  const sampleOrderItems = [];

  for (const orderId of orderIds) {
    const numItems = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < numItems; i++) {
      const quantity = faker.number.int({ min: 1, max: 10 });
      const unitPrice = parseFloat(faker.commerce.price({ min: 20, max: 2000 }));
      sampleOrderItems.push({
        orderId,
        productId: faker.helpers.arrayElement(productIds),
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      });
    }
  }

    await db.insert(orderItems).values(sampleOrderItems).execute();
    console.log('✅ Created order items');
  } else {
    console.log('ℹ️ Orders already exist, skipping order items...');
  }

  // Check and create warranties

  // Check and create warranties
  const existingWarranties = await db.select().from(warranties).limit(1);
  if (existingWarranties.length === 0) {
    const sampleWarranties = productIds.map(productId => {
    const purchaseDate = faker.date.past({ years: 2 });
    const warrantyStartDate = purchaseDate;
    const warrantyEndDate = new Date(warrantyStartDate);
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 2);
    
    return {
      productId,
      customerId: faker.helpers.arrayElement(customerIds),
      orderId: faker.helpers.arrayElement(orderIds),
      serialNumber: faker.string.alphanumeric(16).toUpperCase(),
      purchaseDate,
      warrantyStartDate,
      warrantyEndDate,
      status: faker.helpers.arrayElement(['active', 'expired', 'claimed', 'voided']),
      claimDate: faker.helpers.maybe(() => faker.date.between({ from: purchaseDate, to: new Date() })),
      claimReason: faker.helpers.maybe(() => faker.lorem.sentence()),
      resolutionNotes: faker.helpers.maybe(() => faker.lorem.paragraph())
    };
  });

    await db.insert(warranties).values(sampleWarranties).execute();
    console.log('✅ Created warranty records');
  } else {
    console.log('ℹ️ Warranties already exist, skipping...');
  }

  console.log('✅ Database seeding completed!');
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
