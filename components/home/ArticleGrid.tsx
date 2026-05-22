'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArticlePreview } from '@/lib/types';

interface ArticleGridProps {
  articles: ArticlePreview[];
}

const categories = [
  { key: 'all', label: 'All' },
  { key: 'kitchen-hacks', label: 'Kitchen Hacks' },
  { key: 'closet-organization', label: 'Closet Organization' },
  { key: 'eco-cleaning', label: 'Eco-Cleaning' },
  { key: 'plant-care', label: 'Plant Care' },
  { key: 'laundry-secrets', label: 'Laundry Secrets' },
  { key: 'tech-efficiency', label: 'Tech Efficiency' },
];

const metaLabels: Record<string, string> = {
  'kitchen-hacks': 'Kitchen',
  'closet-organization': 'Organization',
  'eco-cleaning': 'Cleaning',
  'plant-care': 'Plant Care',
  'laundry-secrets': 'Laundry',
  'tech-efficiency': 'Tech Efficiency',
};

export function ArticleGrid({ articles }: ArticleGridProps) {
  const [activeType, setActiveType] = useState<string>('all');

  const filteredArticles = articles.filter(
    (article) => activeType === 'all' || article.type === activeType
  );

  return (
    <>
      <section className="section-intro">
        <h2>Everyday Wisdom for Your Home</h2>
        <p>From kitchen hacks to mindful organization, we provide practical tips to make your home life simpler, cleaner, and more joyful.</p>
      </section>

      <section className="categories" id="articles">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`cat-tag${activeType === cat.key ? ' active' : ''}`}
            onClick={() => setActiveType(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </section>

      <section className="main-feed">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            href={`/${article.type}/${article.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <article className="post-card">
              {article.img ? (
                <img src={article.img} alt={article.title} className="post-img" />
              ) : (
                <div className="post-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  📄
                </div>
              )}
              <div className="post-info">
                <span className="post-meta">{metaLabels[article.type] || article.type}</span>
                <h3>{article.title}</h3>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </>
  );
}
