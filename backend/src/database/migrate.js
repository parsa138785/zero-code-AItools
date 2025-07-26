const fs = require('fs');
const path = require('path');
const database = require('../common/database');

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await database.query(migrationSQL);
    
    console.log('Database migration completed successfully!');
    console.log('All AI tools tables have been created.');
    
    // Verify tables were created
    const result = await database.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%_inputs' OR table_name LIKE '%_outputs'
      ORDER BY table_name;
    `);
    
    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };

