export interface Article {
  id: number;
  slug: string;
  site: string;
  type: string;
  title: string;
  description: string;
  img: string | null;
  author: string | null;
  publishDate: string | null;
  body: string;
  url: string | null;
  language: string | null;
  updatedAt?: string;
}

export interface ArticlePreview {
  id: number;
  slug: string;
  site: string;
  type: string;
  title: string;
  description: string;
  img: string | null;
  author: string | null;
  publishDate: string | null;
}
