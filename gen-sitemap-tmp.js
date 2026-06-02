const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

const [,, SITE_NAME, SITE_DIR, DOMAIN] = process.argv;
const BASE_URL = `https://${DOMAIN}`;
const OUT_DIR = `/root/vercel-projects/${SITE_DIR}/public/sitemap`;
const TODAY = new Date().toISOString().slice(0, 10);
const CHUNK = 5000;

const xmlEscape = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const sql = neon("postgresql://neondb_owner:npg_HKw8qxGg5cfj@ep-fancy-leaf-a4zukau9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require");

(async () => {
  const [articles, authors] = await Promise.all([
    sql`SELECT type, short_title FROM articles WHERE site = ${SITE_NAME} ORDER BY id`,
    sql`SELECT slug FROM authors WHERE site = ${SITE_NAME} ORDER BY id`,
  ]);

  const urls = [`${BASE_URL}/`, `${BASE_URL}/author/team`];
  for (const { slug } of authors) if (slug && slug !== "team") urls.push(`${BASE_URL}/author/${slug}`);
  const types = [...new Set(articles.filter(a => a.type).map(a => a.type))];
  for (const t of types) urls.push(`${BASE_URL}/${t}`);
  for (const { type, short_title } of articles) urls.push(`${BASE_URL}/${type || "articles"}/${short_title}`);

  if (fs.existsSync(OUT_DIR)) fs.readdirSync(OUT_DIR).forEach(f => fs.unlinkSync(path.join(OUT_DIR, f)));
  else fs.mkdirSync(OUT_DIR, { recursive: true });

  const chunks = [];
  for (let i = 0; i < urls.length; i += CHUNK) chunks.push(urls.slice(i, i + CHUNK));

  for (let i = 0; i < chunks.length; i++) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      chunks[i].map(u => `<url>\n<loc>${xmlEscape(u)}</loc>\n<lastmod>${TODAY}</lastmod>\n<changefreq>weekly</changefreq>\n</url>`).join("\n") +
      `\n</urlset>`;
    fs.writeFileSync(path.join(OUT_DIR, `sitemap${i + 1}.xml`), xml);
  }

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    chunks.map((_, i) => `<sitemap>\n<loc>${BASE_URL}/sitemap/sitemap${i + 1}.xml</loc>\n<lastmod>${TODAY}</lastmod>\n</sitemap>`).join("\n") +
    `\n</sitemapindex>`;
  fs.writeFileSync(path.join(OUT_DIR, "sitemapindex.xml"), indexXml);

  console.log(`Total URLs: ${urls.length}, Files: ${chunks.length}`);
})();
