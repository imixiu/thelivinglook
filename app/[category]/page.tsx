import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticlesByType } from '@/lib/queries';

const categoryLabels: Record<string, string> = {
  'kitchen-hacks': 'Kitchen Hacks',
  'closet-organization': 'Closet Organization',
  'eco-cleaning': 'Eco-Cleaning',
  'plant-care': 'Plant Care',
  'laundry-secrets': 'Laundry Secrets',
  'tech-efficiency': 'Tech Efficiency',
};

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabels[category];
  if (!label) return { title: 'Not Found' };
  return { title: `${label} - LifeTips`, description: `Articles about ${label}` };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!categoryLabels[category]) notFound();

  const articles = await getArticlesByType(category);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ marginBottom: 32 }}>{categoryLabels[category]}</h1>
      {articles.length === 0 ? (
        <p style={{ color: '#666' }}>No articles yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/${article.type}/${article.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'block' }}
            >
              {article.img && (
                <img src={article.img} alt={article.title} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              )}
              <div style={{ padding: 20 }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: 8, lineHeight: 1.4 }}>{article.title}</h2>
                {article.description && <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{article.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
