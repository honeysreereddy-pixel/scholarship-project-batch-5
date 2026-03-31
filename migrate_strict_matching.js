// ScholarHub — Strict Matching Schema Upgrade
// This script adds the deep matching criteria and moderation pipeline columns.
// Run: node migrate_strict_matching.js YOUR_DB_PASSWORD

const { Client } = require('pg');

const PROJECT_REF = 'ythjsvxhltqkdrqooshl';
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('\n❌ Usage: node migrate_strict_matching.js YOUR_SUPABASE_DB_PASSWORD');
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
-- 1. Upgrade Scholarships Table
ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS target_country TEXT,
  ADD COLUMN IF NOT EXISTS specific_major TEXT,
  ADD COLUMN IF NOT EXISTS is_first_gen BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS disability_friendly BOOLEAN DEFAULT false;

-- 2. Upgrade Profiles Table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_country TEXT,
  ADD COLUMN IF NOT EXISTS specific_major TEXT,
  ADD COLUMN IF NOT EXISTS is_first_gen BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_disability BOOLEAN DEFAULT false;
`;

async function run() {
  try {
    console.log('\n🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');
    console.log('⚡ Injecting Strict Matching & Admin Pipeline columns...\n');

    await client.query(SQL);

    console.log('✅ Success! The Deep Match schema is now active inside Supabase.\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
