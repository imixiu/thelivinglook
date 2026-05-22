import { getAllArticles } from '@/lib/queries';
import { HeroSection } from '@/components/home/HeroSection';
import { ArticleGrid } from '@/components/home/ArticleGrid';
import { QuickTips } from '@/components/home/QuickTips';

export default async function HomePage() {
  const articles = await getAllArticles();
  const featured = articles.length > 0 ? articles[0] : null;

  return (
    <>
      <HeroSection featured={featured} />
      <ArticleGrid articles={articles} />
      <QuickTips />
    </>
  );
}
