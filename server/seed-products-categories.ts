import 'dotenv/config';
import { db } from './database-storage';
import { categories, products } from '@shared/schema';
import { faker } from '@faker-js/faker';

async function seedProductsAndCategories() {
  console.log('🌱 Starting products and categories seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing products and categories...');
  await db.delete(products);
  await db.delete(categories);

  // Create categories
  console.log('📁 Creating categories...');
  const categoryData = [
    {
      name: 'Power Tools',
      description: 'Electric and battery-powered tools for professional and DIY use',
      slug: 'power-tools',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Hand Tools',
      description: 'Manual tools and implements for precision work',
      slug: 'hand-tools',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Safety Equipment',
      description: 'Personal protective equipment and safety gear',
      slug: 'safety-equipment',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Measuring Tools',
      description: 'Precision measuring and marking instruments',
      slug: 'measuring-tools',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'Accessories',
      description: 'Tool accessories, attachments, and consumables',
      slug: 'accessories',
      isActive: true,
      sortOrder: 5
    },
    {
      name: 'Hardware',
      description: 'Fasteners, fittings, and construction hardware',
      slug: 'hardware',
      isActive: true,
      sortOrder: 6
    },
    {
      name: 'Cutting Tools',
      description: 'Blades, bits, and cutting implements',
      slug: 'cutting-tools',
      isActive: true,
      sortOrder: 7
    },
    {
      name: 'Storage & Organization',
      description: 'Tool storage solutions and organization systems',
      slug: 'storage-organization',
      isActive: true,
      sortOrder: 8
    }
  ];

  const createdCategories = await db.insert(categories).values(categoryData).returning();
  console.log(`✅ Created ${createdCategories.length} categories`);

  // Get category IDs for product creation
  const categoryIds = createdCategories.map(cat => cat.id);

  // Create products for each category
  console.log('🔧 Creating products...');
  
  const productTemplates = {
    'Power Tools': [
      { name: 'Cordless Drill Driver', brand: 'DeWalt', basePrice: 129.99 },
      { name: 'Circular Saw', brand: 'Makita', basePrice: 179.99 },
      { name: 'Angle Grinder', brand: 'Bosch', basePrice: 89.99 },
      { name: 'Impact Wrench', brand: 'Milwaukee', basePrice: 199.99 },
      { name: 'Reciprocating Saw', brand: 'Ryobi', basePrice: 99.99 },
      { name: 'Orbital Sander', brand: 'Black+Decker', basePrice: 69.99 },
      { name: 'Router', brand: 'Porter-Cable', basePrice: 149.99 },
      { name: 'Jigsaw', brand: 'Festool', basePrice: 219.99 }
    ],
    'Hand Tools': [
      { name: 'Socket Set', brand: 'Craftsman', basePrice: 49.99 },
      { name: 'Adjustable Wrench Set', brand: 'Husky', basePrice: 24.99 },
      { name: 'Screwdriver Set', brand: 'Klein Tools', basePrice: 39.99 },
      { name: 'Pliers Set', brand: 'Irwin', basePrice: 34.99 },
      { name: 'Hammer', brand: 'Stanley', basePrice: 19.99 },
      { name: 'Level', brand: 'Empire', basePrice: 29.99 },
      { name: 'Chisel Set', brand: 'Narex', basePrice: 59.99 },
      { name: 'File Set', brand: 'Pferd', basePrice: 44.99 }
    ],
    'Safety Equipment': [
      { name: 'Safety Glasses', brand: '3M', basePrice: 12.99 },
      { name: 'Work Gloves', brand: 'Mechanix', basePrice: 16.99 },
      { name: 'Hard Hat', brand: 'MSA', basePrice: 24.99 },
      { name: 'Respirator Mask', brand: '3M', basePrice: 89.99 },
      { name: 'Safety Vest', brand: 'Ergodyne', basePrice: 19.99 },
      { name: 'Knee Pads', brand: 'Professional', basePrice: 34.99 },
      { name: 'Ear Protection', brand: 'Howard Leight', basePrice: 22.99 },
      { name: 'Fall Harness', brand: 'Miller', basePrice: 129.99 }
    ],
    'Measuring Tools': [
      { name: 'Tape Measure', brand: 'Stanley FatMax', basePrice: 19.99 },
      { name: 'Digital Caliper', brand: 'Mitutoyo', basePrice: 79.99 },
      { name: 'Laser Level', brand: 'Bosch', basePrice: 159.99 },
      { name: 'Speed Square', brand: 'Swanson', basePrice: 14.99 },
      { name: 'Combination Square', brand: 'Starrett', basePrice: 89.99 },
      { name: 'Digital Multimeter', brand: 'Fluke', basePrice: 199.99 },
      { name: 'Stud Finder', brand: 'Zircon', basePrice: 39.99 },
      { name: 'Thickness Gauge', brand: 'Starrett', basePrice: 49.99 }
    ],
    'Accessories': [
      { name: 'Drill Bit Set', brand: 'Irwin', basePrice: 29.99 },
      { name: 'Sandpaper Assortment', brand: '3M', basePrice: 19.99 },
      { name: 'Extension Cord', brand: 'Southwire', basePrice: 34.99 },
      { name: 'Work Light', brand: 'Bayco', basePrice: 49.99 },
      { name: 'Tool Bag', brand: 'Klein Tools', basePrice: 59.99 },
      { name: 'Magnetic Tray', brand: 'Performance Tool', basePrice: 12.99 },
      { name: 'Cable Ties', brand: 'Gardner Bender', basePrice: 8.99 },
      { name: 'Utility Knife Blades', brand: 'Stanley', basePrice: 6.99 }
    ],
    'Hardware': [
      { name: 'Hex Bolt Assortment', brand: 'Hillman', basePrice: 24.99 },
      { name: 'Wood Screws', brand: 'GRK', basePrice: 16.99 },
      { name: 'Washers Set', brand: 'Everbilt', basePrice: 11.99 },
      { name: 'Anchor Bolts', brand: 'Simpson Strong-Tie', basePrice: 19.99 },
      { name: 'Nuts Assortment', brand: 'Hillman', basePrice: 18.99 },
      { name: 'Threaded Rod', brand: 'Everbilt', basePrice: 14.99 },
      { name: 'Lock Washers', brand: 'Hillman', basePrice: 9.99 },
      { name: 'Machine Screws', brand: 'Everbilt', basePrice: 13.99 }
    ],
    'Cutting Tools': [
      { name: 'Circular Saw Blade', brand: 'Freud', basePrice: 39.99 },
      { name: 'Jigsaw Blades', brand: 'Bosch', basePrice: 19.99 },
      { name: 'Hole Saw Kit', brand: 'Lenox', basePrice: 49.99 },
      { name: 'Utility Knife', brand: 'Stanley', basePrice: 9.99 },
      { name: 'Hacksaw Blades', brand: 'Starrett', basePrice: 24.99 },
      { name: 'Bandsaw Blade', brand: 'Olson', basePrice: 29.99 },
      { name: 'Router Bits', brand: 'Freud', basePrice: 79.99 },
      { name: 'Reciprocating Saw Blades', brand: 'Milwaukee', basePrice: 34.99 }
    ],
    'Storage & Organization': [
      { name: 'Tool Box', brand: 'Craftsman', basePrice: 89.99 },
      { name: 'Tool Chest', brand: 'Husky', basePrice: 299.99 },
      { name: 'Parts Organizer', brand: 'Akro-Mils', basePrice: 34.99 },
      { name: 'Pegboard Kit', brand: 'Wall Control', basePrice: 79.99 },
      { name: 'Tool Roll', brand: 'Bucket Boss', basePrice: 24.99 },
      { name: 'Storage Bins', brand: 'Sterilite', basePrice: 19.99 },
      { name: 'Tool Cart', brand: 'Husky', basePrice: 149.99 },
      { name: 'Socket Organizer', brand: 'Ernst', basePrice: 29.99 }
    ]
  };

  const allProducts = [];

  for (const category of createdCategories) {
    const templates = productTemplates[category.name as keyof typeof productTemplates] || [];
    
    for (const template of templates) {
      const product = {
        sku: `${category.slug.toUpperCase()}-${faker.string.alphanumeric(6).toUpperCase()}`,
        name: template.name,
        description: faker.commerce.productDescription(),
        detailedSpecifications: `Professional grade ${template.name.toLowerCase()} from ${template.brand}. Features durable construction, ergonomic design, and reliable performance for demanding applications.`,
        categoryId: category.id,
        brand: template.brand,
        images: [
          faker.image.urlLoremFlickr({ category: 'tools', width: 400, height: 400 }),
          faker.image.urlLoremFlickr({ category: 'tools', width: 400, height: 400 })
        ],
        sellingPrice: (template.basePrice * faker.number.float({ min: 0.9, max: 1.3 })).toFixed(2),
        costPrice: (template.basePrice * faker.number.float({ min: 0.6, max: 0.8 })).toFixed(2),
        isActive: faker.datatype.boolean({ probability: 0.9 })
      };
      
      allProducts.push(product);
    }
  }

  // Insert all products
  await db.insert(products).values(allProducts);
  console.log(`✅ Created ${allProducts.length} products`);

  // Summary
  console.log('\n📊 Seeding Summary:');
  console.log(`• Categories: ${createdCategories.length}`);
  console.log(`• Products: ${allProducts.length}`);
  
  const productsByCategory = createdCategories.map(cat => ({
    category: cat.name,
    count: allProducts.filter(p => p.categoryId === cat.id).length
  }));
  
  console.log('\n📁 Products per category:');
  productsByCategory.forEach(({ category, count }) => {
    console.log(`  • ${category}: ${count} products`);
  });

  console.log('\n🎉 Products and categories seeding completed successfully!');
}

// Run the seeding function
seedProductsAndCategories()
  .then(() => {
    console.log('✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

export { seedProductsAndCategories };