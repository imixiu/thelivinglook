const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function main() {
  console.log('=== Batch-fixing future-dated articles ===');
  
  // Get stats before
  const beforeStats = await pool.query(
    "SELECT COUNT(*) as future_count FROM articles WHERE site = 'furnishcuration' AND published_time > NOW()"
  );
  const futureCount = beforeStats.rows[0].future_count;
  console.log(`Future-dated articles before fix: ${futureCount}`);
  
  if (futureCount === 0) {
    console.log('No future-dated articles found. Nothing to fix.');
    await pool.end();
    return;
  }
  
  // Get the max date to calculate offset
  const maxDate = await pool.query(
    "SELECT MAX(published_time) as max_date FROM articles WHERE site = 'furnishcuration'"
  );
  const maxDateObj = new Date(maxDate.rows[0].max_date);
  const now = new Date();
  const offsetDays = Math.floor((maxDateObj - now) / (1000 * 60 * 60 * 24));
  
  console.log(`Latest article date: ${maxDateObj.toISOString().split('T')[0]}`);
  console.log(`Today: ${now.toISOString().split('T')[0]}`);
  console.log(`Offset to subtract: ${offsetDays} days`);
  
  // Update all future-dated articles
  const updateSql = `
    UPDATE articles 
    SET 
      published_time = published_time - INTERVAL '${offsetDays} days',
      modified_time = NOW()
    WHERE site = 'furnishcuration' AND published_time > NOW()
  `;
  const result = await pool.query(updateSql);
  console.log(`Updated ${result.rowCount} articles`);
  
  // Verify
  const afterStats = await pool.query(
    "SELECT COUNT(*) as future_count, MIN(published_time) as earliest, MAX(published_time) as latest FROM articles WHERE site = 'furnishcuration'"
  );
  console.log(`\n=== After fix ===`);
  console.log(`Future-dated: ${afterStats.rows[0].future_count}`);
  console.log(`Earliest: ${afterStats.rows[0].earliest}`);
  console.log(`Latest: ${afterStats.rows[0].latest}`);
  
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
