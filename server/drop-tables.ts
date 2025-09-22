import 'dotenv/config';
import { db } from './database-storage.js';
import { sql } from 'drizzle-orm';

async function dropConflictingTables() {
  console.log('🗑️  Dropping conflicting tables and enums...');
  
  try {
    // Drop tables in correct order (dependencies first)
    await db.execute(sql`DROP TABLE IF EXISTS order_items CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS inventory CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS warranties CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS products CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS categories CASCADE`);
    
    // Drop the enum type
    await db.execute(sql`DROP TYPE IF EXISTS category CASCADE`);
    
    console.log('✅ Successfully dropped conflicting tables and enum');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
  }
  
  process.exit(0);
}

dropConflictingTables();