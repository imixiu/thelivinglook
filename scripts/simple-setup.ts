import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Vercel Postgres 数据库通过环境变量自动提供连接 URL
const sql = neon(process.env.DATABASE_URL!);

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

async function main() {
  try {
    console.log('🔌 连接到 Vercel Postgres 数据库...');

    // 创建表
    console.log('📋 创建 articles 表...');
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id             VARCHAR(255) PRIMARY KEY,
        slug           VARCHAR(255) NOT NULL,
        category       VARCHAR(50)  NOT NULL,
        category_label VARCHAR(100) NOT NULL,
        title          VARCHAR(500) NOT NULL,
        summary        TEXT,
        icon           VARCHAR(10),
        icon_bg        VARCHAR(10),
        read_time      SMALLINT,
        likes          VARCHAR(20),
        author         VARCHAR(100),
        publish_date   DATE,
        body           TEXT         NOT NULL,
        created_at     TIMESTAMPTZ  DEFAULT NOW(),
        updated_at     TIMESTAMPTZ  DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_category_slug ON articles(category, slug)`;

    console.log('✅ 表创建成功！');

    // 读取并导入文章数据
    console.log('\n📖 导入文章数据...');
    const articlesPath = path.join(__dirname, '../data/articles.json');
    const { articles } = JSON.parse(fs.readFileSync(articlesPath, 'utf-8')) as { articles: ArticleData[] };

    // 清空现有数据
    await sql`DELETE FROM articles`;
    console.log('🗑️  清空现有数据');

    // 批量插入文章
    for (const article of articles) {
      await sql`
        INSERT INTO articles (
          id, slug, category, category_label, title, summary,
          icon, icon_bg, read_time, likes, author, publish_date, body
        ) VALUES (
          ${article.id}, ${article.slug}, ${article.category}, ${article.categoryLabel},
          ${article.title}, ${article.summary}, ${article.icon}, ${article.iconBg},
          ${parseInt(article.readTime)}, ${article.likes}, ${article.author},
          ${article.publishDate}::date, ${article.body}
        )
      `;
      console.log(`  ✅ ${article.title}`);
    }

    // 验证结果
    const result = await sql`SELECT COUNT(*) as count FROM articles`;
    console.log(`\n🎉 数据库初始化完成！共 ${result[0].count} 篇文章`);

    // 测试查询
    const testQuery = await sql`
      SELECT category, COUNT(*) as count
      FROM articles
      GROUP BY category
      ORDER BY count DESC
    `;

    console.log('\n📊 文章分类统计:');
    testQuery.forEach((row: any) => {
      console.log(`  ${row.category}: ${row.count} 篇`);
    });

  } catch (error) {
    console.error('❌ 失败:', error);
    process.exit(1);
  }
}

main();