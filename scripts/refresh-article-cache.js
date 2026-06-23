/**
 * 逐篇刷新文章缓存：删旧缓存 → 查DB → 写新缓存
 * 一篇一篇来，避免缓存雪崩
 */
const Redis = require('ioredis');
const { neon, neonConfig } = require('@neondatabase/serverless');

neonConfig.fetchConnectionCache = true;

const redisUrl = process.env.REDIS_URL;
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!redisUrl) { console.error('REDIS_URL missing'); process.exit(1); }
if (!dbUrl) { console.error('DATABASE_URL missing'); process.exit(1); }

const redis = new Redis(redisUrl, { lazyConnect: true, enableOfflineQueue: false });
const sql = neon(dbUrl);

function formatDate(date) {
  if (!date) return null;
  if (typeof date === 'object' && typeof date.toISOString === 'function') {
    return date.toISOString().split('T')[0];
  }
  const str = String(date);
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

async function main() {
  await redis.connect();

  // 1. 获取所有在线文章的 type + short_title
  console.log('Fetching article list...');
  const rows = await sql(
    `SELECT id, type, short_title, site, title, description, img, author, published_time, modified_time, body, url, language
     FROM articles
     WHERE site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')
     ORDER BY id`
  );
  console.log(`Total articles: ${rows.length}`);

  let refreshed = 0;
  let skipped = 0;
  let errors = 0;
  const batchSize = 50; // 每50篇打印一次进度
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const key = `article:${row.type}:${row.short_title}`;

    try {
      // 删旧缓存
      await redis.del(key);

      // 重新构造缓存对象（与 queries.ts getArticle 逻辑一致）
      const article = {
        id: row.id,
        slug: row.short_title,
        site: row.site,
        type: row.type,
        title: row.title,
        description: row.description,
        img: row.img,
        author: row.author,
        publishDate: formatDate(row.published_time),
        body: row.body,
        url: row.url,
        language: row.language,
        updatedAt: row.modified_time ? formatDate(row.modified_time) ?? undefined : undefined,
      };

      // 写入新缓存（TTL=0 即永不过期，与原代码一致）
      await redis.set(key, JSON.stringify(article));

      refreshed++;

      if (refreshed % batchSize === 0) {
        console.log(`Progress: ${refreshed}/${rows.length} refreshed (${((refreshed / rows.length) * 100).toFixed(1)}%)`);
      }

      // 小延迟，避免打满 Redis
      if (i % 100 === 99) await delay(100);

    } catch (e) {
      errors++;
      if (errors <= 5) console.error(`Error on ${key}: ${e.message}`);
    }
  }

  console.log(`\nDone. Refreshed: ${refreshed}, Errors: ${errors}, Total: ${rows.length}`);
  redis.disconnect();
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
