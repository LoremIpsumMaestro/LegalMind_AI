import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = await fs.readdir(migrationsDir);
    
    // Sort migration files to ensure they run in order
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sql = await fs.readFile(
        path.join(migrationsDir, file),
        'utf8'
      );
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        throw error;
      }
      
      console.log(`Completed migration: ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

runMigrations();
