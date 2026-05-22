import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

async function getPassword(): Promise<string> {
  const host = process.env.PGHOST!;
  const region = process.env.AWS_REGION!;

  // 先获取 AWS 临时凭证
  const credsJson = execSync(
    `aws sts assume-role-with-web-identity \
      --role-arn "${process.env.AWS_ROLE_ARN}" \
      --role-session-name "seed-session" \
      --web-identity-token "${process.env.VERCEL_OIDC_TOKEN}" \
      --region "${region}" \
      --query "Credentials" --output json`,
    { encoding: 'utf-8' }
  );
  const creds = JSON.parse(credsJson);

  process.env.AWS_ACCESS_KEY_ID = creds.AccessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = creds.SecretAccessKey;
  process.env.AWS_SESSION_TOKEN = creds.SessionToken;

  // 生成 RDS auth token
  const token = execSync(
    `aws rds generate-db-auth-token \
      --hostname "${host}" \
      --port 5432 \
      --username postgres \
      --region "${region}"`,
    { encoding: 'utf-8' }
  ).trim();

  return token;
}

async function main() {
  console.log('🔑 获取数据库认证 token...');
  const password = await getPassword();

  const client = new Client({
    host: process.env.PGHOST,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  console.log('🔌 连接数据库...');
  await client.connect();
  console.log('✅ 连接成功！');

  // 创建表
  console.log('\n📋 创建 articles 表...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await client.query(schema);
  console.log('✅ 表创建成功！');

  // 导入文章数据
  console.log('\n📖 导入文章数据...');
  const { articles } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/articles.json'), 'utf-8')
  ) as { articles: ArticleData[] };

  await client.query('DELETE FROM articles');

  for (const article of articles) {
    await client.query(
      `INSERT INTO articles
        (id, slug, category, category_label, title, summary, icon, icon_bg, read_time, likes, author, publish_date, body)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::date,$13)`,
      [
        article.id, article.slug, article.category, article.categoryLabel,
        article.title, article.summary, article.icon, article.iconBg,
        parseInt(article.readTime), article.likes, article.author,
        article.publishDate, article.body,
      ]
    );
    console.log(`  ✅ ${article.title}`);
  }

  const result = await client.query('SELECT COUNT(*) as count FROM articles');
  console.log(`\n🎉 数据库初始化完成！共 ${result.rows[0].count} 篇文章`);

  // 打印 DATABASE_URL
  const token = encodeURIComponent(password);
  console.log('\n📌 DATABASE_URL（请添加到 Vercel 环境变量）:');
  console.log(`postgresql://postgres:${token}@${process.env.PGHOST}:5432/postgres?sslmode=require`);

  await client.end();
}

main().catch((err) => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});