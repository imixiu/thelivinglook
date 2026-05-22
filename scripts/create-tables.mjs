import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  try {
    console.log('🔧 创建数据库表...');
    
    // 直接执行创建表的 SQL
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
    
    console.log('📊 创建索引...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_category_slug ON articles(category, slug);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_publish_date ON articles(publish_date DESC);`;
    
    console.log('✅ 表和索引创建成功！');
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    throw error;
  }
}

createTables();
