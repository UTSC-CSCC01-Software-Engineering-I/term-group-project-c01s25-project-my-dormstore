import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

async function addPackageInventoryAndTriggers() {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PWD,
    port: process.env.PG_PORT,
  });

  try {
    console.log('Adding inventory field to packages table...');
    
    // Add inventory column to packages table
    await pool.query(`
      ALTER TABLE packages 
      ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 100
    `);
    
    console.log('✅ Inventory field added to packages table');
    
    // Create function to update related packages stock
    console.log('Creating function to update related packages stock...');
    
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_related_packages_stock()
      RETURNS TRIGGER AS $$
      DECLARE
        pkg_id INTEGER;
      BEGIN
        FOR pkg_id IN
          SELECT DISTINCT package_id
          FROM package_items
          WHERE product_id = NEW.id
        LOOP
          -- Update each related package's inventory based on minimum available stock
          UPDATE packages
          SET inventory = (
            SELECT
              CASE WHEN COUNT(*) = 0 THEN 0
                   ELSE MIN(FLOOR(p.inventory / pi.quantity)) END
            FROM package_items pi
            JOIN products p ON pi.product_id = p.id
            WHERE pi.package_id = pkg_id
          ),
          updated_at = CURRENT_TIMESTAMP
          WHERE id = pkg_id;
        END LOOP;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('✅ Function update_related_packages_stock() created');
    
    // Create trigger on products table
    console.log('Creating trigger on products table...');
    
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_auto_update_package_stock ON products;
    `);
    
    await pool.query(`
      CREATE TRIGGER trg_auto_update_package_stock
      AFTER UPDATE OF inventory ON products
      FOR EACH ROW
      WHEN (OLD.inventory IS DISTINCT FROM NEW.inventory)
      EXECUTE FUNCTION update_related_packages_stock();
    `);
    
    console.log('✅ Trigger trg_auto_update_package_stock created on products table');
    
    // Create function to handle package inventory reduction during checkout
    console.log('Creating function for package inventory reduction...');
    
    await pool.query(`
      CREATE OR REPLACE FUNCTION reduce_package_inventory_on_order()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Reduce package inventory when package is ordered
        UPDATE packages
        SET inventory = inventory - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.package_id;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('✅ Function reduce_package_inventory_on_order() created');
    
    // Create order_packages table if it doesn't exist
    console.log('Creating order_packages table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_packages (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ order_packages table created');
    
    // Create trigger on order_packages table
    console.log('Creating trigger on order_packages table...');
    
    await pool.query(`
      DROP TRIGGER IF EXISTS trg_reduce_package_inventory ON order_packages;
    `);
    
    await pool.query(`
      CREATE TRIGGER trg_reduce_package_inventory
      AFTER INSERT ON order_packages
      FOR EACH ROW
      EXECUTE FUNCTION reduce_package_inventory_on_order();
    `);
    
    console.log('✅ Trigger trg_reduce_package_inventory created on order_packages table');
    
    // Initialize package inventory based on current product inventory
    console.log('Initializing package inventory...');
    
    await pool.query(`
      UPDATE packages p
      SET inventory = (
        SELECT
          CASE WHEN COUNT(*) = 0 THEN 100
               ELSE MIN(FLOOR(prod.inventory / pi.quantity)) END
        FROM package_items pi
        JOIN products prod ON pi.product_id = prod.id
        WHERE pi.package_id = p.id
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE p.inventory IS NULL OR p.inventory = 100;
    `);
    
    console.log('✅ Package inventory initialized based on product inventory');
    
    // Show summary
    const packageCount = await pool.query('SELECT COUNT(*) FROM packages');
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    const packageItemCount = await pool.query('SELECT COUNT(*) FROM package_items');
    
    console.log('\n📊 Summary:');
    console.log(`   - Packages: ${packageCount.rows[0].count}`);
    console.log(`   - Products: ${productCount.rows[0].count}`);
    console.log(`   - Package items: ${packageItemCount.rows[0].count}`);
    console.log('\n✅ Package inventory management system is ready!');
    console.log('\n🔧 How it works:');
    console.log('   1. When product inventory changes → related package inventory updates automatically');
    console.log('   2. When package is ordered → package inventory reduces automatically');
    console.log('   3. Packages with no sub-products → inventory reduces directly during checkout');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addPackageInventoryAndTriggers(); 