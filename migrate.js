// ScholarHub — Supabase Migration Runner
// This script adds eligibility columns to the scholarships table
// Run: node migrate.js YOUR_DB_PASSWORD

const { Client } = require('pg');

const PROJECT_REF = 'ythjsvxhltqkdrqooshl';
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('\n❌ Usage: node migrate.js YOUR_SUPABASE_DB_PASSWORD');
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
ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS min_gpa             NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS eligible_levels     TEXT[],
  ADD COLUMN IF NOT EXISTS eligible_genders    TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS income_level        TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS min_age             INTEGER,
  ADD COLUMN IF NOT EXISTS max_age             INTEGER,
  ADD COLUMN IF NOT EXISTS eligible_nationalities TEXT DEFAULT 'All';

UPDATE public.scholarships
SET
  eligible_genders        = 'Any',
  income_level            = 'Any',
  eligible_nationalities  = 'All'
WHERE eligible_genders IS NULL;
`;

async function run() {
  try {
    console.log('\n🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');
    console.log('⚡ Running migration...');
    await client.query(SQL);
    console.log('✅ Migration complete! Eligibility columns added to scholarships table.\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
