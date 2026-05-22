import { query } from './db';
import { Article, ArticlePreview } from './types';

// 辅助函数：将 Date 对象转换为 YYYY-MM-DD 字符串
function formatDate(date: any): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date);
}

// 获取所有文章（首页用）- 只显示 is_online = 'Y' 的文章
export async function getAllArticles(): Promise<ArticlePreview[]> {
  const rows = await query(`
    SELECT
      id, short_title as slug, type as category, title, description as summary,
      img, author, published_time as publish_date, tag, is_online
    FROM articles
    WHERE site = 'thelivinglook'
      AND is_online = 'Y'
    ORDER BY published_time DESC
    LIMIT 50
  `);

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    category: row.category,
    categoryLabel: row.category,
    title: row.title,
    summary: row.summary,
    icon: null,
    iconBg: null,
    readTime: 0,
    likes: '',
    author: row.author,
    publishDate: formatDate(row.publish_date),
    tag: row.tag ?? null,
    isOnline: row.is_online ?? "Y",
  }));
}

// 根据分类和 slug 获取单篇文章 - 只返回 is_online = 'Y' 的文章
export async function getArticle(category: string, slug: string): Promise<Article | null> {
  const rows = await query(
    'SELECT * FROM articles WHERE site = \'thelivinglook\' AND type = $1 AND short_title = $2 AND is_online = \'Y\' LIMIT 1',
    [category, slug]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id,
    slug: row.short_title,
    category: row.type,
    categoryLabel: row.type,
    title: row.title,
    summary: row.description,
    icon: null,
    iconBg: null,
    readTime: 0,
    likes: '',
    author: row.author,
    publishDate: formatDate(row.published_time),
    body: row.body,
    createdAt: row.published_time ? formatDate(row.published_time) : undefined,
    updatedAt: row.modified_time ? formatDate(row.modified_time) : undefined,
    tag: row.tag ?? null,
    isOnline: row.is_online ?? "Y",
  };
}

// 获取相关文章（同分类，排除当前文章）- 只返回 is_online = 'Y' 的文章
export async function getRelatedArticles(category: string, excludeId: string): Promise<ArticlePreview[]> {
  const rows = await query(
    `SELECT
      id, short_title as slug, type as category, title, description as summary,
      img, author, published_time as publish_date, tag, is_online
    FROM articles
    WHERE site = 'thelivinglook' AND type = $1 AND id != $2 AND is_online = 'Y'
    ORDER BY published_time DESC
    LIMIT 3`,
    [category, excludeId]
  );

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    category: row.category,
    categoryLabel: row.category,
    title: row.title,
    summary: row.summary,
    icon: null,
    iconBg: null,
    readTime: 0,
    likes: '',
    author: row.author,
    publishDate: formatDate(row.publish_date),
    tag: row.tag ?? null,
    isOnline: row.is_online ?? "Y",
  }));
}

// 按分类获取文章列表（category page 用）
export async function getArticlesByType(type: string): Promise<ArticlePreview[]> {
  const rows = await query(
    `SELECT
      id, short_title as slug, type as category, title, description as summary,
      img, author, published_time as publish_date, tag, is_online
    FROM articles
    WHERE site = 'thelivinglook' AND type = $1 AND is_online = 'Y'
    ORDER BY published_time DESC
    LIMIT 50`,
    [type]
  );

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    category: row.category,
    categoryLabel: row.category,
    title: row.title,
    summary: row.summary,
    icon: null,
    iconBg: null,
    readTime: 0,
    likes: '',
    author: row.author,
    publishDate: formatDate(row.publish_date),
    tag: row.tag ?? null,
    isOnline: row.is_online ?? "Y",
  }));
}
