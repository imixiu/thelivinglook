export interface Article {
  id: string;
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  summary: string;
  icon: string;
  iconBg: string;
  readTime: number;
  likes: string;
  author: string;
  publishDate: string; // YYYY-MM-DD format
  body: string; // HTML content
  createdAt?: string;
  updatedAt?: string;
  tag: string | null;
  isOnline: string;
}

export type Category = 'sourcing' | 'platforms' | 'logistics' | 'negotiation' | 'trends' | 'all';

export interface ArticlePreview {
  id: string;
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  summary: string;
  icon: string;
  iconBg: string;
  readTime: number;
  likes: string;
  author: string;
  publishDate: string;
  tag: string | null;
  isOnline: string;
}