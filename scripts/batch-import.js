const { Pool } = require('pg');
const https = require('https');

const DB_URL = 'postgresql://neondb_owner:npg_HKw8qxGg5cfj@ep-fancy-leaf-a4zukau9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const SITE = 'thelivinglook';
const SITEMAP_INDEX = `https://www.alibaba.com/sitemap/${SITE}/sitemapindex.xml`;
const ARTICLE_API = 'https://lifetips.alibaba.com/verticalSite/article.json';
const CONCURRENCY = 5;
const BATCH_SIZE = 50;

const pool = new Pool({
  connectionString: DB_URL,
  max: 10,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 30000,
});

let stats = { total: 0, inserted: 0, skipped: 0, failed: 0, apiEmpty: 0 };

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 20000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1]);
  return urls;
}

function parseSlugAndType(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return { type: parts[parts.length - 2], slug: parts[parts.length - 1] };
  }
  return null;
}

async function fetchArticle(url) {
  const key = `${SITE}||${url}`;
  const apiUrl = `${ARTICLE_API}?key=${encodeURIComponent(key)}`;
  const res = await httpGet(apiUrl);
  if (res.status !== 200) return null;
  try {
    return JSON.parse(res.body);
  } catch {
    return null;
  }
}

async function insertArticle(art, slug, type) {
  await pool.query(
    `INSERT INTO articles (site, type, short_title, language, published_time, modified_time, img, title, description, url, body)
     VALUES ($1,$2,$3,$4,NOW(),NOW(),$5,$6,$7,$8,$9)`,
    [art.site || SITE, type, slug, 'en', art.img, art.title, art.description, art.url, art.body]
  );
}

async function processUrl(url, existingSlugs) {
  const parsed = parseSlugAndType(url);
  if (!parsed) { stats.failed++; return; }

  const key = `${parsed.type}::${parsed.slug}`;
  if (existingSlugs.has(key)) { stats.skipped++; return; }

  try {
    const art = await fetchArticle(url);
    if (!art || !art.title || !art.body) { stats.apiEmpty++; return; }
    await insertArticle(art, parsed.slug, parsed.type);
    existingSlugs.add(key);
    stats.inserted++;
  } catch (e) {
    stats.failed++;
    if (stats.failed <= 10) console.error(`  FAIL: ${url} - ${e.message}`);
  }
}

async function runBatch(urls, existingSlugs) {
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const chunk = urls.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(u => processUrl(u, existingSlugs)));
  }
}

async function loadExistingSlugs() {
  const rows = await pool.query(
    `SELECT type, short_title FROM articles WHERE site = $1`,
    [SITE]
  );
  const set = new Set();
  rows.rows.forEach(r => set.add(`${r.type}::${r.short_title}`));
  console.log(`已有 ${set.size} 篇文章，将跳过重复`);
  return set;
}

async function main() {
  const startArg = parseInt(process.argv[2]) || 1;
  const endArg = parseInt(process.argv[3]) || 999;

  console.log(`=== 批量导入 ${SITE} 文章 ===`);
  console.log(`Sitemap 范围: ${startArg} - ${endArg}, 并发: ${CONCURRENCY}\n`);

  const existingSlugs = await loadExistingSlugs();

  // 获取 sitemap index
  const indexRes = await httpGet(SITEMAP_INDEX);
  const sitemapUrls = extractUrls(indexRes.body);
  console.log(`共 ${sitemapUrls.length} 个子 sitemap\n`);

  for (let i = 0; i < sitemapUrls.length; i++) {
    const sitemapNum = i + 1;
    if (sitemapNum < startArg || sitemapNum > endArg) continue;

    const sitemapUrl = sitemapUrls[i];
    process.stdout.write(`[Sitemap ${sitemapNum}/${sitemapUrls.length}] 加载中...`);

    try {
      const res = await httpGet(sitemapUrl);
      const urls = extractUrls(res.body);
      stats.total += urls.length;
      console.log(` ${urls.length} 个 URL`);

      const beforeInserted = stats.inserted;
      await runBatch(urls, existingSlugs);

      const newInserted = stats.inserted - beforeInserted;
      console.log(`  ✓ 新增 ${newInserted} | 跳过 ${stats.skipped} | 失败 ${stats.failed} | API空 ${stats.apiEmpty} | 累计写入 ${stats.inserted}\n`);
    } catch (e) {
      console.log(` 加载失败: ${e.message}`);
    }
  }

  console.log('\n=== 完成 ===');
  console.log(`总URL: ${stats.total} | 写入: ${stats.inserted} | 跳过: ${stats.skipped} | 失败: ${stats.failed} | API空: ${stats.apiEmpty}`);

  await pool.end();
}

main().catch(e => {
  console.error('Fatal:', e.message);
  pool.end();
  process.exit(1);
});
