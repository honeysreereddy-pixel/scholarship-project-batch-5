// ScholarHub — Profile Schema Expansion Migration Runner
// This script adds student personal/academic eligibility columns to the profiles table
// Run: node migrate_profiles.js YOUR_DB_PASSWORD

const { Client } = require('pg');

const PROJECT_REF = 'ythjsvxhltqkdrqooshl';
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('\n❌ Usage: node migrate_profiles.js YOUR_SUPABASE_DB_PASSWORD');
  console.error('   Find it at: Supabase Dashboard → Settings → Database → Database password\n');
  process.exit(1);
}

const client = new Client({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS avatar_url,
  ADD COLUMN IF NOT EXISTS age             INTEGER,
  ADD COLUMN IF NOT EXISTS gender          TEXT DEFAULT 'Prefer not to say',
  ADD COLUMN IF NOT EXISTS nationality     TEXT,
  ADD COLUMN IF NOT EXISTS income_level    TEXT,
  ADD COLUMN IF NOT EXISTS academic_level  TEXT,
  ADD COLUMN IF NOT EXISTS gpa             NUMERIC(3,2);
`;

async function run() {
  try {
    console.log('\n🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');
    console.log('⚡ Running migration to add Profile demographic fields...');
    await client.query(SQL);
    console.log('✅ Migration complete! Profile table now actively supports Smart Matching attributes.\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
