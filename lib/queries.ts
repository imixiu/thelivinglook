import { query } from './db';
import { Article, ArticlePreview } from './types';

// 辅助函数：将 Date 对象转换为 YYYY-MM-DD 字符串
function formatDate(date: any): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date);
}

// 获取所有文章（首页用）- 只显示英文文章
export async function getAllArticles(): Promise<ArticlePreview[]> {
  const rows = await query(`
    SELECT
      id, slug, category, category_label, title, summary,
      icon, icon_bg, read_time, likes, author, publish_date, tag, is_online
    FROM articles
    WHERE category IN ('sourcing', 'platforms', 'logistics', 'negotiation', 'trends')
      AND is_online = 'Y'
    ORDER BY publish_date DESC
  `);

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    category: row.category,
    categoryLabel: row.category_label,
    title: row.title,
    summary: row.summary,
    icon: row.icon,
    iconBg: row.icon_bg,
    readTime: row.read_time,
    likes: row.likes,
    author: row.author,
    publishDate: formatDate(row.publish_date),
    tag: row.tag ?? null,
    isOnline: row.is_online ?? "Y",
  }));
}

// 根据分类和 slug 获取单篇文章
export async function getArticle(category: string, slug: string): Promise<Article | null> {
  const rows = await query(
    'SELECT * FROM articles WHERE category = $1 AND slug = $2 AND is_online = \'Y\' LIMIT 1',
    [category, slug]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    categoryLabel: row.category_label,
    title: row.title,
    summary: row.summary,
    icon: row.icon,
    iconBg: row.icon_bg,
    readTime: row.read_time,
    likes: row.likes,
    author: row.author,
    publishDate: formatDate(row.publish_date),
    body: row.body,
    createdAt: row.created_at ? formatDate(row.created_at) : undefined,
    updatedAt: row.updated_at ? formatDate(row.updated_at) : undefined,
    tag: row.tag ?? null,
    isOnline: row.is_online ?? "Y",
  };
}

// 获取相关文章（同分类，排除当前文章）
export async function getRelatedArticles(category: string, excludeId: string): Promise<ArticlePreview[]> {
  const rows = await query(
    `SELECT
      id, slug, category, category_label, title, summary,
      icon, icon_bg, read_time, likes, author, publish_date, tag, is_online
    FROM articles
    WHERE category = $1 AND id != $2 AND is_online = 'Y'
    ORDER BY publish_date DESC
    LIMIT 3`,
    [category, excludeId]
  );

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    category: row.category,
    categoryLabel: row.category_label,
    title: row.title,
    summary: row.summary,
    icon: row.icon,
    iconBg: row.icon_bg,
    readTime: row.read_time,
    likes: row.likes,
    author: row.author,
    publishDate: formatDate(row.publish_date),
    tag: row.tag ?? null,
    isOnline: row.is_online ?? "Y",
  }));
}