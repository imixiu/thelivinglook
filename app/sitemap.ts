import { query } from '@/lib/db';

const SITE_URL = 'https://www.thelivinglook.com';

// Static category pages (from app/[category]/page.tsx categoryLabels)
const categoryPages = [
  { slug: 'kitchen-hacks', lastMod: '2026-02-01' },
  { slug: 'closet-organization', lastMod: '2026-03-01' },
  { slug: 'eco-cleaning', lastMod: '2026-01-20' },
  { slug: 'plant-care', lastMod: '2026-03-15' },
  { slug: 'laundry-secrets', lastMod: '2026-01-01' },
  { slug: 'tech-efficiency', lastMod: '2026-03-10' },
];

export default async function sitemap() {
  // Fetch online articles from DB
  const rows = await query(`
    SELECT type, short_title, published_time
    FROM articles
    WHERE site = 'thelivinglook' AND is_online = 'Y'
    ORDER BY published_time DESC
  `);

  // Article pages: /{type}/{slug}
  const articleUrls = rows.map((row: any) => ({
    url: `${SITE_URL}/${row.type}/${row.short_title}`,
    lastModified: row.published_time
      ? new Date(row.published_time).toISOString().split('T')[0]
      : undefined,
  }));

  // Category pages: /{category}
  const categoryUrls = categoryPages.map((cat) => ({
    url: `${SITE_URL}/${cat.slug}`,
    lastModified: cat.lastMod,
  }));

  return [
    // Homepage
    {
      url: SITE_URL,
      lastModified: new Date().toISOString().split('T')[0],
      priority: 1,
    },
    // Category pages
    ...categoryUrls.map((u: { url: string; lastModified: string }) => ({ ...u, priority: 0.8 })),
    // Article pages
    ...articleUrls.map((u: { url: string; lastModified?: string }) => ({ ...u, priority: 0.9 })),
  ];
}
