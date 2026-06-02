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
  const rows = await query(
    'SELECT * FROM articles WHERE type = $1 AND short_title = $2 AND site = $3 AND (is_online IS NULL OR is_online = \'Y\') LIMIT 1',
    [type, slug, 'thelivinglook']
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
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
}

export async function getArticlesByType(type: string, page = 1, pageSize = 24): Promise<{ articles: ArticlePreview[]; total: number }> {
  const offset = (page - 1) * pageSize;
  const [rows, countRows] = await Promise.all([
    query(
      `SELECT id, short_title, site, type, title, description, img, author, published_time
      FROM articles WHERE type = $1 AND site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y') ORDER BY published_time DESC LIMIT $2 OFFSET $3`,
      [type, pageSize, offset]
    ),
    query(`SELECT COUNT(*) as total FROM articles WHERE type = $1 AND site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')`, [type]),
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

export async function getRelatedArticles(type: string, excludeId: number): Promise<ArticlePreview[]> {
  const rows = await query(
    `SELECT id, short_title, site, type, title, description, img, author, published_time
    FROM articles
    WHERE type = $1 AND id != $2 AND site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')
    ORDER BY published_time DESC
    LIMIT 3`,
    [type, excludeId]
  );

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
