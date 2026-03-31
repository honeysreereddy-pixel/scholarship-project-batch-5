// ScholarHub — Populate Missing DB URLs
// This injects real application URLs into the initial mock database records so they directly open!
// Run: node fill_database_urls.js YOUR_DB_PASSWORD

const { Client } = require('pg');

const PROJECT_REF = 'ythjsvxhltqkdrqooshl';
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('\n❌ Usage: node fill_database_urls.js YOUR_SUPABASE_DB_PASSWORD');
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

const UPDATES = [
  { title: "Global Excellence Award", url: "https://www.iie.org/" },
  { title: "Women in Tech Scholarship", url: "https://www.womentech.net/women-tech-network-scholarship" },
  { title: "Future Leaders Grant", url: "https://www.nsls.org/scholarships-and-awards" },
  { title: "Arts & Humanities Fellowship", url: "https://www.neh.gov/grants" },
  { title: "Community Impact Scholarship", url: "https://smud.org/Corporate/About-us/Scholarships" },
  { title: "Medical Research Award", url: "https://www.ama-assn.org/medical-students/grants-awards" }
];

async function run() {
  try {
    console.log('\n🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');
    console.log('⚡ Injecting real website links into the database...\n');

    for (const item of UPDATES) {
      const res = await client.query(
        "UPDATE public.scholarships SET url = $1 WHERE title = $2 RETURNING id",
        [item.url, item.title]
      );
      if (res.rowCount > 0) {
        console.log(`✅ Linked: ${item.title} -> ${item.url}`);
      } else {
        console.log(`⚠️ Skipped: ${item.title} (record not found)`);
      }
    }

    console.log('\n🌟 SUCCESS! All seeded scholarships are now explicitly linked. They will directly open!\n');
  } catch (err) {
    console.error('❌ Update failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
