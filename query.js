const { Pool } = require('pg');
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const pool = new Pool({ connectionString: url, statement_timeout: 10000, ssl: { rejectUnauthorized: false } });

async function main() {
  try {
    const total = await pool.query("SELECT COUNT(*) as cnt FROM articles WHERE site = 'thelivinglook'");
    console.log('TOTAL:', total.rows[0].cnt);

    const last7 = await pool.query("SELECT COUNT(*) as cnt FROM articles WHERE site = 'thelivinglook' AND published_time >= NOW() - INTERVAL '7 days'");
    console.log('LAST_7_DAYS:', last7.rows[0].cnt);

    const byType = await pool.query("SELECT type, COUNT(*) as cnt FROM articles WHERE site = 'thelivinglook' GROUP BY type ORDER BY cnt DESC");
    console.log('BY_TYPE:', JSON.stringify(byType.rows));

    const recent = await pool.query("SELECT short_title, published_time, type FROM articles WHERE site = 'thelivinglook' ORDER BY published_time DESC LIMIT 5");
    console.log('RECENT_5:', JSON.stringify(recent.rows));

    const byLang = await pool.query("SELECT language, COUNT(*) as cnt FROM articles WHERE site = 'thelivinglook' GROUP BY language ORDER BY cnt DESC");
    console.log('BY_LANG:', JSON.stringify(byLang.rows));
  } catch (e) {
    console.error(e.message);
  } finally {
    pool.end();
  }
}

main();
