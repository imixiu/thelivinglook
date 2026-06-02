import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const SITE_URL = 'https://thelivinglook.com';
const ARTICLES_PER_SITEMAP = 50000;

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  // Get total count of online articles
  const countResult = await query(
    `SELECT COUNT(*) as total FROM articles WHERE site = 'thelivinglook' AND is_online = 'Y'`
  );
  const totalArticles = parseInt(countResult[0].total);

  // Calculate number of sitemap files needed
  const numSitemaps = Math.ceil(totalArticles / ARTICLES_PER_SITEMAP);

  // Build sitemap index XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Homepage
  xml += `<sitemap>\n`;
  xml += `  <loc>${SITE_URL}/</loc>\n`;
  xml += `  <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
  xml += `</sitemap>\n`;

  // Static category pages
  const categories = [
    { slug: 'kitchen-hacks', lastMod: new Date().toISOString().split('T')[0] },
    { slug: 'closet-organization', lastMod: '2026-03-01' },
    { slug: 'eco-cleaning', lastMod: '2026-01-20' },
    { slug: 'plant-care', lastMod: '2026-03-15' },
    { slug: 'laundry-secrets', lastMod: '2026-01-01' },
    { slug: 'tech-efficiency', lastMod: '2026-03-10' },
  ];

  for (const cat of categories) {
    xml += `<sitemap>\n`;
    xml += `  <loc>${SITE_URL}/${cat.slug}</loc>\n`;
    xml += `  <lastmod>${cat.lastMod}</lastmod>\n`;
    xml += `</sitemap>\n`;
  }

  // Article sitemaps (paginated) - use /sitemap/N.xml URLs
  for (let i = 1; i <= numSitemaps; i++) {
    xml += `<sitemap>\n`;
    xml += `  <loc>${SITE_URL}/sitemap/${i}.xml</loc>\n`;
    xml += `  <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += `</sitemap>\n`;
  }

  xml += `</sitemapindex>\n`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
