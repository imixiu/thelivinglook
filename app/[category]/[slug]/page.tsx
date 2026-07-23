import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticle, getRelatedArticles } from '@/lib/queries';

export const revalidate = 86400;
import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleBody } from '@/components/article/ArticleBody';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { ArticleToc } from '@/components/article/ArticleToc';

interface ArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.category, resolvedParams.slug);

  if (!article) {
    return { title: 'Article Not Found - TheLivingLook' };
  }

  const url = `https://thelivinglook.com/${resolvedParams.category}/${resolvedParams.slug}`;
  const defaultImg = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=630&fit=crop';
  const img = (article.img && !article.img.includes('alicdn.com')) ? article.img : defaultImg;

  return {
    title: `${article.title} - TheLivingLook`,
    description: article.description,
    authors: article.author ? [{ name: article.author }] : [{ name: 'TheLivingLook Team' }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description || '',
      url,
      images: [{ url: img, width: 1200, height: 630, alt: article.title }],
      siteName: 'TheLivingLook',
      locale: 'en_US',
      publishedTime: article.publishDate || undefined,
      modifiedTime: article.updatedAt || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description || '',
      images: [img],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.category, resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.type, article.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: (article.img && !article.img.includes('alicdn.com')) ? article.img : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=630&fit=crop',
    url: `https://thelivinglook.com/${resolvedParams.category}/${resolvedParams.slug}`,
    datePublished: article.publishDate || undefined,
    dateModified: article.updatedAt || undefined,
    author: {
      '@type': article.author ? 'Person' : 'Organization',
      name: article.author || 'TheLivingLook Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TheLivingLook',
      logo: { '@type': 'ImageObject', url: 'https://thelivinglook.com/logo.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://thelivinglook.com/${resolvedParams.category}/${resolvedParams.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="article-layout">
      <main className="article-main">
        <article className="article-container">
          <ArticleHeader article={article} />
          <ArticleBody body={article.body} />
          <div className="author-section-card">
            <div className="author-avatar-container">
              <div className="author-avatar" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', backgroundColor: '#e0f7f7', color: '#00a8a8',
              }}>
                {article.author ? article.author.charAt(0).toUpperCase() : 'L'}
              </div>
            </div>
            <div className="author-info">
              <h3>{article.author || 'TheLivingLook Team'}</h3>
              <p className="author-bio">
                Contributing writer at TheLivingLook, sharing practical everyday tips to make your home life simpler, cleaner, and more joyful.
              </p>
            </div>
          </div>
        </article>
      </main>

      <aside className="article-sidebar">
        <ArticleToc body={article.body} />
        <RelatedArticles articles={relatedArticles} />
      </aside>
    </div>
    </>
  );
}
