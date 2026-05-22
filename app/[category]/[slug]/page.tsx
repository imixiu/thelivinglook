import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticle, getRelatedArticles } from '@/lib/queries';
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

  return {
    title: `${article.title} - TheLivingLook`,
    description: article.description,
    alternates: {
      canonical: `https://www.thelivinglook.com/${resolvedParams.category}/${resolvedParams.slug}`,
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

  return (
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
  );
}
