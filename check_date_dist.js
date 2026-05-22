const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function main() {
  // Check DB server time
  const dbTime = await pool.query("SELECT NOW() as db_now");
  console.log('DB server time:', dbTime.rows[0].db_now);
  
  // Check date distribution
  const distribution = await pool.query(`
    SELECT 
      CASE 
        WHEN published_time > NOW() THEN 'future'
        WHEN published_time > NOW() - INTERVAL '30 days' THEN 'last_30_days'
        WHEN published_time > NOW() - INTERVAL '90 days' THEN 'last_90_days'
        WHEN published_time > NOW() - INTERVAL '365 days' THEN 'last_year'
        ELSE 'older'
      END as period,
      COUNT(*) as count,
      MIN(published_time) as earliest,
      MAX(published_time) as latest
    FROM articles 
    WHERE site = 'furnishcuration'
    GROUP BY 1
    ORDER BY 1
  `);
  
  console.log('\n=== Date Distribution ===');
  for (const row of distribution.rows) {
    console.log(`${row.period}: ${row.count} articles (${row.earliest} to ${row.latest})`);
  }
  
  // Check the actual latest dates
  const latest = await pool.query(`
    SELECT published_time, title 
    FROM articles 
    WHERE site = 'furnishcuration'
    ORDER BY published_time DESC 
    LIMIT 10
  `);
  
  console.log('\n=== 10 Most Recent Articles ===');
  for (const row of latest.rows) {
    console.log(`${row.published_time.toISOString().split('T')[0]} | ${row.title.substring(0, 60)}`);
  }
  
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
