import { getAllArticles, getFeaturedArticle } from '@/lib/queries';
import { HeroSection } from '@/components/home/HeroSection';
import { ArticleGrid } from '@/components/home/ArticleGrid';
import { QuickTips } from '@/components/home/QuickTips';

export default async function HomePage() {
  const [articles, featured] = await Promise.all([
    getAllArticles(),
    getFeaturedArticle(),
  ]);

  return (
    <>
      <HeroSection featured={featured} />
      <ArticleGrid articles={articles} />
      <QuickTips />
    </>
  );
}
