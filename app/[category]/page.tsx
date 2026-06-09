import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticlesByType } from '@/lib/queries';

export const revalidate = 3600;

const categoryLabels: Record<string, string> = {
  'kitchen-hacks': 'Kitchen Hacks',
  'closet-organization': 'Closet Organization',
  'eco-cleaning': 'Eco-Cleaning',
  'plant-care': 'Plant Care',
  'laundry-secrets': 'Laundry Secrets',
  'tech-efficiency': 'Tech Efficiency',
};

const categoryDescriptions: Record<string, string> = {
  'kitchen-hacks': 'Expert kitchen tips: meal prep workflows, cookware care, food storage, and cooking shortcuts from professional chefs.',
  'closet-organization': 'Closet and wardrobe organization: decluttering guides, storage solutions, capsule wardrobes, and space-saving systems.',
  'eco-cleaning': 'Non-toxic cleaning solutions: natural ingredients, green products, and eco-friendly methods for every room in your home.',
  'plant-care': 'Indoor plant care guides: watering schedules, light requirements, soil tips, and plant selection for every skill level.',
  'laundry-secrets': 'Laundry care expertise: fabric-specific washing, dryer optimization, stain removal, and garment longevity tips.',
  'tech-efficiency': 'Smart home and tech guides: energy-saving automations, appliance reviews, and digital tools for efficient living.',
};

const PAGE_SIZE = 24;

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabels[category];
  if (!label) return { title: 'Not Found' };
  return {
    title: `${label} - TheLivingLook`,
    description: categoryDescriptions[category] || `Articles about ${label}`,
    alternates: { canonical: `https://thelivinglook.com/${category}` },
    openGraph: {
      type: 'website',
      title: `${label} - TheLivingLook`,
      description: categoryDescriptions[category] || `Articles about ${label}`,
      url: `https://thelivinglook.com/${category}`,
      siteName: 'TheLivingLook',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title: `${label} - TheLivingLook`,
      description: categoryDescriptions[category] || `Articles about ${label}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;
  if (!categoryLabels[category]) notFound();

  const page = Math.max(1, parseInt(pageStr || '1'));
  const { articles, total } = await getArticlesByType(category, page, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ marginBottom: 8 }}>{categoryLabels[category]}</h1>
      <p style={{ color: '#888', marginBottom: 32, fontSize: '0.9rem' }}>{total.toLocaleString()} articles</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${article.type}/${article.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'block' }}
          >
            {article.img && (
              <img src={article.img} alt={article.title} loading="lazy" width={400} height={180} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: 16 }}>
              <h2 style={{ fontSize: '1rem', marginBottom: 8, lineHeight: 1.4 }}>{article.title}</h2>
              {article.description && <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.description}</p>}
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
          {page > 1 && (
            <Link href={`/${category}?page=${page - 1}`} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none', color: '#333' }}>← Prev</Link>
          )}
          <span style={{ color: '#666', fontSize: '0.9rem' }}>Page {page} of {totalPages.toLocaleString()}</span>
          {page < totalPages && (
            <Link href={`/${category}?page=${page + 1}`} style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: 6, textDecoration: 'none', color: '#333' }}>Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}
