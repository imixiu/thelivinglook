import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

interface ArticleData {
  id: string;
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  summary: string;
  icon: string;
  iconBg: string;
  readTime: string;
  likes: string;
  author: string;
  publishDate: string;
  body: string;
}

async function seed() {
  // 检查环境变量
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Run: vercel env pull');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 读取文章数据
    const articlesPath = path.join(__dirname, '../data/articles.json');
    const articlesFile = fs.readFileSync(articlesPath, 'utf-8');
    const { articles } = JSON.parse(articlesFile) as { articles: ArticleData[] };

    console.log(`📖 Found ${articles.length} articles`);

    // Clear existing data
    await sql`DELETE FROM articles`;
    console.log('🗑️  Cleared articles table');

    // Insert data
    for (const article of articles) {
      await sql`
        INSERT INTO articles (
          id, slug, category, category_label, title, summary,
          icon, icon_bg, read_time, likes, author, publish_date, body
        ) VALUES (
          ${article.id},
          ${article.slug},
          ${article.category},
          ${article.categoryLabel},
          ${article.title},
          ${article.summary},
          ${article.icon},
          ${article.iconBg},
          ${parseInt(article.readTime)},
          ${article.likes},
          ${article.author},
          ${article.publishDate}::date,
          ${article.body}
        )
      `;
      console.log(`✅ Inserted: ${article.title}`);
    }

    // Verify
    const count = await sql`SELECT COUNT(*) as count FROM articles`;
    console.log(`\n🎉 Successfully imported ${count[0].count} articles!`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();