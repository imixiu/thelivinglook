import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const SITE_URL = 'https://thelivinglook.com';
const ARTICLES_PER_SITEMAP = 5000;

export const revalidate = 3600; // Revalidate every hour

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ n: string }> }
) {
  const resolvedParams = await params;
  const pageNum = parseInt(resolvedParams.n);

  if (isNaN(pageNum) || pageNum < 1) {
    return new NextResponse('Invalid sitemap number', { status: 400 });
  }

  // 1-based pagination: pageNum 1 = first 50K articles (offset 0)
  const offset = (pageNum - 1) * ARTICLES_PER_SITEMAP;

  // Fetch articles for this page
  const rows = await query(
    `SELECT type, short_title, published_time
     FROM articles
     WHERE site = 'thelivinglook' AND is_online = 'Y'
     ORDER BY published_time DESC
     LIMIT $1 OFFSET $2`,
    [ARTICLES_PER_SITEMAP, offset]
  );

  if (rows.length === 0) {
    return new NextResponse('No articles found for this page', { status: 404 });
  }

  // Build sitemap XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const row of rows) {
    const lastMod = row.published_time
      ? new Date(row.published_time).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    xml += `<url>\n`;
    xml += `  <loc>${SITE_URL}/${row.type}/${row.short_title}</loc>\n`;
    xml += `  <lastmod>${lastMod}</lastmod>\n`;
    xml += `  <priority>0.9</priority>\n`;
    xml += `</url>\n`;
  }

  xml += `</urlset>\n`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
