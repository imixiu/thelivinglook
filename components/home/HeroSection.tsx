import Link from 'next/link';
import { ArticlePreview } from '@/lib/types';

interface HeroSectionProps {
  featured: ArticlePreview | null;
}

export function HeroSection({ featured }: HeroSectionProps) {
  return (
    <section className="hero">
      <div className="hero-card">
        <div className="hero-img" />
        <div className="hero-content">
          <span className="badge">Trending Now</span>
          {featured ? (
            <>
              <h1>{featured.title}</h1>
              <p>{featured.description}</p>
              <Link href={`/${featured.type}/${featured.slug}`} className="read-link">
                Read Full Guide &rarr;
              </Link>
            </>
          ) : (
            <>
              <h1>Smart Solutions for Everyday Living</h1>
              <p>Practical tips on kitchen hacks, organization, cleaning, plant care, and tech efficiency.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
