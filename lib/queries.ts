import { tairGet } from "./tair";
import { query } from './db';
import { Article, ArticlePreview } from './types';

function formatDate(date: any): string | null {
  if (!date) return null;
  // Handle Date objects (including cross-realm from neon serverless driver)
  if (typeof date === 'object' && typeof date.toISOString === 'function') {
    return date.toISOString().split('T')[0];
  }
  // For strings, extract YYYY-MM-DD prefix
  const str = String(date);
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

export async function getFeaturedArticle(): Promise<ArticlePreview | null> {
  const rows = await query(
    `SELECT id, short_title, site, type, title, description, img, author, published_time
    FROM articles
    WHERE short_title = ? AND is_online = 'Y' LIMIT 1`,
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
    WHERE img IS NOT NULL AND site = 'thelivinglook' AND is_online = 'Y'
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
  const key = `thelivinglook:article:${type}:${slug}`;
  const cached = await tairGet(key);
  if (cached) return cached;

  const rows = await query(
    'SELECT * FROM articles WHERE type = ? AND short_title = ? AND site = ? AND is_online = \'Y\' LIMIT 1',
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

  return article;
}

export async function getArticlesByType(type: string, page = 1, pageSize = 24): Promise<{ articles: ArticlePreview[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const [rows, countRows] = await Promise.all([
    query(
      `SELECT id, short_title, site, type, title, description, img, author, published_time
      FROM articles WHERE type = ? AND site = 'thelivinglook' AND is_online = 'Y' ORDER BY published_time DESC LIMIT ? OFFSET ?`,
      [type, pageSize, offset]
    ),
    query(`SELECT COUNT(*) as total FROM articles WHERE type = ? AND site = 'thelivinglook' AND is_online = 'Y'`, [type]),
  ]);
  return {
    articles: rows.map((row: any) => ({
      id: row.id, slug: row.short_title, site: row.site, type: row.type,
      title: row.title, description: row.description, img: row.img,
      author: row.author, publishDate: formatDate(row.published_time),
    })),
    total: parseInt(countRows[0].total),
  };
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
  // 优化：避免 ORDER BY published_time DESC 全表扫描
  // 第一步：用索引快速查候选 ID
  const idRows = await query(
    `SELECT id FROM articles WHERE site = 'thelivinglook' AND type = ? AND is_online = 'Y'`,
    [type]
  );

  if (idRows.length === 0) return [];

  // 第二步：应用层 seeded shuffle 选 3 篇（排除当前文章）
  const ids = (idRows as any[]).map(r => r.id).filter(id => id !== excludeId);
  const shuffled = seededShuffle(ids, excludeId).slice(0, 3);

  if (shuffled.length === 0) return [];

  // 第三步：主键精确查详情
  const placeholders = shuffled.map(() => '?').join(',');
  const rows = await query(
    `SELECT id, short_title, type, title, img FROM articles WHERE id IN (${placeholders})`,
    shuffled
  );

  return (rows as any[]).map(row => ({
    id: row.id, slug: row.short_title, type: row.type,
    title: row.title, img: row.img,
  })) as unknown as ArticlePreview[];
}
