const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const sql = neon(process.env.DATABASE_URL);

async function createTables() {
  try {
    const schema = fs.readFileSync('scripts/schema.sql', 'utf8');
    console.log('🔧 创建数据库表...');
    
    // 将多个 SQL 语句分开执行
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`执行: ${statement.substring(0, 50)}...`);
        // 使用模板字符串语法
        const result = await sql([statement]);
        console.log(`✅ 完成`);
      }
    }
    
    console.log('✅ 表创建成功！');
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    if (error.message.includes('already exists')) {
      console.log('ℹ️  表已经存在，跳过创建');
    } else {
      throw error;
    }
  }
}

createTables();
