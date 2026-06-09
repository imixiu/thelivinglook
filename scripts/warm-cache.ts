import { neon } from '@neondatabase/serverless';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.DATABASE_URL!);
const redis = new Redis({
  host: 'r-0xibcglmce6bxri39ppd.redis.rds-aliyun-america.rds.aliyuncs.com',
  port: 6379,
  password: 'P%7ySpwF+G_S)13+#VR9FkifaI',
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

function formatDate(date: any): string | null {
  if (!date) return null;
  return String(date).split('T')[0];
}

const BATCH = 500;

async function main() {
  await redis.connect();

  const [{ total }] = await sql`SELECT COUNT(*) as total FROM articles WHERE site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')` as any;
  console.log(`Total articles: ${total}`);

  let offset = 0;
  let cached = 0;
  let skipped = 0;

  while (offset < total) {
    const rows = await sql`
      SELECT id, short_title, site, type, title, description, img, author,
             published_time, body, url, language, modified_time
      FROM articles
      WHERE site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')
      ORDER BY id
      LIMIT ${BATCH} OFFSET ${offset}
    ` as any[];

    if (rows.length === 0) break;

    const pl = redis.pipeline();
    for (const row of rows) {
      const key = `article:${row.type}:${row.short_title}`;
      const article = {
        id: row.id, slug: row.short_title, site: row.site, type: row.type,
        title: row.title, description: row.description, img: row.img,
        author: row.author, publishDate: formatDate(row.published_time),
        body: row.body, url: row.url, language: row.language,
        updatedAt: row.modified_time ? formatDate(row.modified_time) : undefined,
      };
      pl.set(key, JSON.stringify(article)); // no TTL = permanent
    }
    await pl.exec();

    cached += rows.length;
    offset += BATCH;
    process.stdout.write(`\r${cached}/${total} (${Math.round(cached/total*100)}%)`);
  }

  console.log(`\nDone. Cached ${cached} articles, skipped ${skipped}.`);
  await redis.quit();
}

main().catch(e => { console.error(e); process.exit(1); });
