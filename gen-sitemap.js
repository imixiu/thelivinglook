const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = 'postgresql://neondb_owner:npg_HKw8qxGg5cfj@ep-fancy-leaf-a4zukau9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const [,, SITE_NAME, SITE_DIR, DOMAIN] = process.argv;
const BASE_URL = `https://${DOMAIN}`;
const TODAY = new Date().toISOString().split('T')[0];
const OUT_DIR = `/root/vercel-project/${SITE_DIR}/public/sitemap`;

const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function makeSitemap(urls) {
  const entries = urls.map(u => `<url>\n<loc>${xmlEscape(u)}</loc>\n<lastmod>${TODAY}</lastmod>\n<changefreq>weekly</changefreq>\n</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>`;
}

async function main() {
  const [articles, authors] = await Promise.all([
    pool.query(`SELECT type, short_title FROM articles WHERE site = $1 ORDER BY id`, [SITE_NAME]),
    pool.query(`SELECT slug FROM authors WHERE site = $1 ORDER BY id`, [SITE_NAME]),
  ]);

  const urls = [];
  urls.push(`${BASE_URL}/`);
  urls.push(`${BASE_URL}/author/team`);
  for (const { slug } of authors.rows) {
    if (slug !== 'team') urls.push(`${BASE_URL}/author/${slug}`);
  }
  const seenTypes = new Set();
  for (const { type } of articles.rows) {
    if (type && !seenTypes.has(type)) { seenTypes.add(type); urls.push(`${BASE_URL}/${type}`); }
  }
  for (const { type, short_title } of articles.rows) {
    urls.push(`${BASE_URL}/${type ? `${type}/${short_title}` : `articles/${short_title}`}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.readdirSync(OUT_DIR).forEach(f => fs.unlinkSync(path.join(OUT_DIR, f)));

  const CHUNK = 5000;
  const files = [];
  for (let i = 0; i < urls.length; i += CHUNK) {
    const num = files.length + 1;
    const fname = `sitemap${num}.xml`;
    fs.writeFileSync(path.join(OUT_DIR, fname), makeSitemap(urls.slice(i, i + CHUNK)));
    files.push(fname);
    if (num % 10 === 0) process.stdout.write(`  ${num} files written...\n`);
  }

  const indexEntries = files.map(f => `<sitemap>\n<loc>${BASE_URL}/sitemap/${f}</loc>\n<lastmod>${TODAY}</lastmod>\n</sitemap>`).join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'sitemapindex.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries}\n</sitemapindex>`);

  console.log(`Total URLs: ${urls.length}`);
  console.log(`Sitemap files: ${files.length}`);
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
