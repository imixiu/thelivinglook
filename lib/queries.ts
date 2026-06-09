import { cacheGet, cacheSet } from './redis';
import { query } from './db';
import { Article, ArticlePreview } from './types';

function formatDate(date: any): string | null {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date).split('T')[0];
}

export async function getFeaturedArticle(): Promise<ArticlePreview | null> {
  const rows = await query(
    `SELECT id, short_title, site, type, title, description, img, author, published_time
    FROM articles
    WHERE short_title = $1 AND (is_online IS NULL OR is_online = 'Y') LIMIT 1`,
    ['vinegar-vs-commercial-cleaners-the-real-results']
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id, slug: row.short_title, site: row.site, type: row.type,
    title: row.title, description: row.description, img: row.img,
    author: row.author, publishDate: formatDate(row.published_time),
  };
}

export async function getAllArticles(): Promise<ArticlePreview[]> {
  const rows = await query(`
    SELECT id, short_title, site, type, title, description, img, author, published_time
    FROM articles
    WHERE img IS NOT NULL AND site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')
    ORDER BY published_time DESC
  `);

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.short_title,
    site: row.site,
    type: row.type,
    title: row.title,
    description: row.description,
    img: row.img,
    author: row.author,
    publishDate: formatDate(row.published_time),
  }));
}

export async function getArticle(type: string, slug: string): Promise<Article | null> {
  const key = `article:${type}:${slug}`;
  const cached = await cacheGet(key);
  if (cached) return cached;

  const rows = await query(
    'SELECT * FROM articles WHERE type = $1 AND short_title = $2 AND site = $3 AND (is_online IS NULL OR is_online = \'Y\') LIMIT 1',
    [type, slug, 'thelivinglook']
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  const article = {
    id: row.id, slug: row.short_title, site: row.site, type: row.type,
    title: row.title, description: row.description, img: row.img,
    author: row.author, publishDate: formatDate(row.published_time),
    body: row.body, url: row.url, language: row.language,
    updatedAt: row.modified_time ? formatDate(row.modified_time) ?? undefined : undefined,
  };
  await cacheSet(key, article, 0);
  return article;
}

export async function getArticlesByType(type: string, page = 1, pageSize = 24): Promise<{ articles: ArticlePreview[]; total: number }> {
  const key = `articles-by-type:${type}:${page}:${pageSize}`;
  const cached = await cacheGet(key);
  if (cached) return cached;

  const offset = (page - 1) * pageSize;
  const [rows, countRows] = await Promise.all([
    query(
      `SELECT id, short_title, site, type, title, description, img, author, published_time
      FROM articles WHERE type = $1 AND site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y') ORDER BY published_time DESC LIMIT $2 OFFSET $3`,
      [type, pageSize, offset]
    ),
    query(`SELECT COUNT(*) as total FROM articles WHERE type = $1 AND site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')`, [type]),
  ]);
  const result = {
    articles: rows.map((row: any) => ({
      id: row.id, slug: row.short_title, site: row.site, type: row.type,
      title: row.title, description: row.description, img: row.img,
      author: row.author, publishDate: formatDate(row.published_time),
    })),
    total: parseInt(countRows[0].total),
  };
  await cacheSet(key, result, 259200);
  return result;
}

type RelatedItem = { id: number; slug: string; type: string; title: string; img: string | null };

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getRelatedArticles(type: string, excludeId: number): Promise<ArticlePreview[]> {
  const key = `related:${type}`;
  const cached = await cacheGet(key);
  const pool: RelatedItem[] = cached ?? await (async () => {
    const rows = await query(
      `SELECT id, short_title, type, title, img
      FROM articles
      WHERE type = $1 AND site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')
      ORDER BY published_time DESC LIMIT 200`,
      [type]
    );
    const result = rows.map((row: any) => ({ id: row.id, slug: row.short_title, type: row.type, title: row.title, img: row.img }));
    await cacheSet(key, result, 259200);
    return result;
  })();
  return seededShuffle(pool.filter((a) => a.id !== excludeId), excludeId).slice(0, 3) as unknown as ArticlePreview[];
}
