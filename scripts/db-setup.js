#!/usr/bin/env node

const { execSync } = require('child_process');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 手动加载 .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)="?([^"]*)"?$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

async function main() {
  loadEnv();

  const {
    AWS_ROLE_ARN, AWS_REGION, VERCEL_OIDC_TOKEN,
    PGHOST, PGDATABASE, PGUSER
  } = process.env;

  console.log('🔑 获取 AWS 临时凭证...');

  // 使用 OIDC token 获取临时 AWS 凭证
  const credsJson = execSync(
    `aws sts assume-role-with-web-identity \
      --role-arn "${AWS_ROLE_ARN}" \
      --role-session-name "db-setup" \
      --web-identity-token "${VERCEL_OIDC_TOKEN}" \
      --region "${AWS_REGION}" \
      --query "Credentials" \
      --output json`,
    { encoding: 'utf-8' }
  );
  const creds = JSON.parse(credsJson);

  process.env.AWS_ACCESS_KEY_ID = creds.AccessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = creds.SecretAccessKey;
  process.env.AWS_SESSION_TOKEN = creds.SessionToken;

  console.log('🔑 生成 RDS auth token...');
  const password = execSync(
    `aws rds generate-db-auth-token \
      --hostname "${PGHOST}" \
      --port 5432 \
      --username "${PGUSER}" \
      --region "${AWS_REGION}"`,
    { encoding: 'utf-8' }
  ).trim();

  console.log('🔌 连接数据库...');
  const client = new Client({
    host: PGHOST,
    port: 5432,
    database: PGDATABASE,
    user: PGUSER,
    password,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✅ 连接成功！');

  // 建表
  console.log('\n📋 创建 articles 表...');
  await client.query(`
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
    )
  `);

  await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_category_slug ON articles(category, slug)`);
  console.log('✅ 表创建成功！');

  // 导入数据
  console.log('\n📖 导入文章数据...');
  const { articles } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../data/articles.json'), 'utf-8')
  );

  await client.query('DELETE FROM articles');
  console.log('🗑️  清空现有数据');

  for (const a of articles) {
    await client.query(
      `INSERT INTO articles
        (id,slug,category,category_label,title,summary,icon,icon_bg,read_time,likes,author,publish_date,body)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::date,$13)`,
      [a.id, a.slug, a.category, a.categoryLabel, a.title, a.summary,
       a.icon, a.iconBg, parseInt(a.readTime), a.likes, a.author, a.publishDate, a.body]
    );
    console.log(`  ✅ ${a.title}`);
  }

  const r = await client.query('SELECT COUNT(*) as count FROM articles');
  console.log(`\n🎉 完成！共导入 ${r.rows[0].count} 篇文章到数据库`);

  await client.end();
}

main().catch(err => {
  console.error('❌ 失败:', err.message);
  process.exit(1);
});