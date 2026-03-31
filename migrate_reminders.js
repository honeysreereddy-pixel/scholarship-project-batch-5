// ScholarHub — Reminders Table Migration
// This script creates the 'reminders' table for Advanced Deadline Tracking push notifications.
// Run: node migrate_reminders.js YOUR_DB_PASSWORD

const { Client } = require('pg');

const PROJECT_REF = 'ythjsvxhltqkdrqooshl';
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('\n❌ Usage: node migrate_reminders.js YOUR_SUPABASE_DB_PASSWORD');
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
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id TEXT NOT NULL,
  title TEXT NOT NULL,
  trigger_date TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists then recreate (safe idempotency)
DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.reminders;
CREATE POLICY "Users can manage their own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);
`;

async function run() {
  try {
    console.log('\n🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');
    console.log('⚡ Running migration to create Reminders tracking table...');
    await client.query(SQL);
    console.log('✅ Migration complete! Reminders table is active and secured by RLS.\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
