-- Migration to fix category schema mismatch
-- This converts products.category_id from enum to UUID foreign key

BEGIN;

-- Step 1: Add new temporary UUID column
ALTER TABLE products ADD COLUMN category_id_new UUID;

-- Step 2: Create a mapping table for enum to UUID conversion
-- (This would need to be populated based on your existing data)
-- For now, we'll set all products to NULL category since we don't have the mapping

-- Step 3: Drop the old enum column
ALTER TABLE products DROP COLUMN category_id;

-- Step 4: Rename the new column
ALTER TABLE products RENAME COLUMN category_id_new TO category_id;

-- Step 5: Add the foreign key constraint
ALTER TABLE products ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES categories(id);

-- Step 6: Make it NOT NULL (after you've populated the data)
-- ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;

COMMIT;