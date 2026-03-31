// ScholarHub — Automated Radar Simulator
// This script simulates a web scraper pipeline grabbing 15 highly strict global scholarships.
// Run: node scripts/run_aggregator.js YOUR_DB_PASSWORD

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'ythjsvxhltqkdrqooshl';
const DB_PASSWORD = process.argv[2];

if (!DB_PASSWORD) {
  console.error('\n❌ Usage: node run_aggregator.js YOUR_SUPABASE_DB_PASSWORD\n');
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

// A generated bulk of diverse strict scholarships mimicking a scraped JSON payload
const MOCK_SCRAPED_DATA = [
  { t: "Chevening Global",                 p: "UK Govt",   a: "Full Ride", d: "2026-11-05", l: "UK",           c: "Leadership", gpa: 8.0, n: "All",   tc: "UK",    mj: "Any", fg: false, dsb: false, url: "https://www.chevening.org/" },
  { t: "First-Gen STEM Leaders",           p: "TechCorps", a: "$10,000",   d: "2026-06-30", l: "USA",          c: "STEM",       gpa: 6.5, n: "USA",   tc: "USA",   mj: "Computer Science", fg: true, dsb: false, url: "https://www.nsf.gov/" },
  { t: "Disability Advocacy Grant",        p: "AccessEd",  a: "€5,000",    d: "2026-08-15", l: "Europe",       c: "Social Work",gpa: null,n: "All",   tc: "Europe",mj: "Any", fg: false, dsb: true, url: "https://www.edf-feph.org/" },
  { t: "Tata Indian Scholars Program",     p: "Tata Group",a: "₹1,00,000", d: "2026-12-01", l: "India",        c: "Technology", gpa: 7.5, n: "India", tc: "India", mj: "Engineering", fg: false, dsb: false, url: "https://www.tatatrusts.org/" },
  { t: "Canadian Medical Grant",           p: "HealthCan", a: "$20,000 CAD",d: "2026-09-01",l: "Canada",       c: "Medicine",   gpa: 8.5, n: "Canada",tc: "Canada",mj: "Medicine", fg: false, dsb: false, url: "https://cihr-irsc.gc.ca/" },
  { t: "Erasmus Architecture Fellowship",  p: "EU Edu",    a: "€10,000",   d: "2026-04-20", l: "Europe",       c: "Arts",       gpa: 7.0, n: "All",   tc: "Europe",mj: "Architecture", fg: false, dsb: false, url: "https://erasmus-plus.ec.europa.eu/" },
  { t: "Global Business Ethics Award",     p: "FinanceHub",a: "$15,000",   d: "2026-10-15", l: "Worldwide",    c: "Business",   gpa: 9.0, n: "All",   tc: "Any",   mj: "Business Administration", fg: false, dsb: false, url: "https://www.weforum.org/" },
  { t: "Minority Law Foundation Grant",    p: "JusticeNet",a: "$8,000",    d: "2026-07-25", l: "USA",          c: "Law",        gpa: 6.0, n: "USA",   tc: "USA",   mj: "Law", fg: true, dsb: false, url: "https://www.americanbar.org/" },
  { t: "African Development Scholarship",  p: "WorldBank", a: "Full Ride", d: "2026-05-15", l: "Africa",       c: "Economics",  gpa: 8.0, n: "Africa",tc: "Africa",mj: "Economics", fg: false, dsb: false, url: "https://www.afdb.org/" },
  { t: "Australian Tech Innovators",       p: "AusGov",    a: "$12,000 AUD",d: "2026-11-20",l: "Australia",    c: "Technology", gpa: 7.5, n: "All",   tc: "Australia", mj: "Computer Science", fg: false, dsb: false, url: "https://www.csiro.au/" },
];

async function run() {
  try {
    console.log('\n🔌 Simulated Scraper Engine running... connecting to DB');
    await client.connect();
    console.log('✅ Connected!');

    console.log('⚡ Scraping 10 new strict scholarships... (Injecting as Pending Approval)\n');

    let inserted = 0;
    for (const s of MOCK_SCRAPED_DATA) {
      // Check if exists to prevent duplicate runs
      const check = await client.query('SELECT id FROM public.scholarships WHERE title = $1', [s.t]);
      if (check.rowCount === 0) {
        await client.query(`
          INSERT INTO public.scholarships 
          (title, provider, amount, deadline, location, category, min_gpa, eligible_nationalities, target_country, specific_major, is_first_gen, disability_friendly, url, is_approved)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, false)
        `, [s.t, s.p, s.a, s.d, s.l, s.c, s.gpa, s.n, s.tc, s.mj, s.fg, s.dsb, s.url]);
        console.log(` -> 📥 Scraped: ${s.t} (Bot Queue)`);
        inserted++;
      } else {
        console.log(` -> ⏩ Skipped: ${s.t} (Already scraped)`);
      }
    }

    console.log(`\n🎉 Web Scraping Simulation Complete! ${inserted} new strict matches placed in Admin Pending Queue.\n`);
  } catch (err) {
    console.error('❌ Aggregator failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
