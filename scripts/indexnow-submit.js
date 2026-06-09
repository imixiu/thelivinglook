const { Pool } = require('pg');
const https = require('https');

const SITE = 'thelivinglook.com';
const KEY = '148cc26eb1744a5799e885b6b2425800';
const DB_URL = 'postgresql://neondb_owner:npg_HKw8qxGg5cfj@ep-fancy-leaf-a4zukau9-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';
const BATCH = 10000;

function post(urls) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ host: SITE, key: KEY, urlList: urls });
    const req = https.request({
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) },
    }, res => resolve(res.statusCode));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const pool = new Pool({ connectionString: DB_URL });
  const { rows } = await pool.query(
    "SELECT url FROM articles WHERE site='thelivinglook' AND is_online='Y' ORDER BY id"
  );
  await pool.end();

  const urls = rows.map(r => r.url);
  urls.push(`https://${SITE}/`, ...['kitchen-hacks','closet-organization','eco-cleaning','plant-care','laundry-secrets','tech-efficiency'].map(s => `https://${SITE}/${s}`));

  console.log(`Total URLs: ${urls.length}`);
  let done = 0;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    const status = await post(batch);
    done += batch.length;
    console.log(`[${done}/${urls.length}] batch status: ${status}`);
    if (i + BATCH < urls.length) await new Promise(r => setTimeout(r, 1000));
  }
  console.log('Done.');
}

main().catch(console.error);
