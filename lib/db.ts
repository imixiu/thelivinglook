import { neon } from '@neondatabase/serverless';

// 构建 DATABASE_URL
function getDatabaseUrl(): string {
  // 优先使用 DATABASE_URL 环境变量
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // 从单独的环境变量构建连接字符串
  const {
    PGUSER = 'postgres',
    PGPASSWORD = '',
    PGHOST,
    PGPORT = '5432',
    PGDATABASE = 'postgres',
  } = process.env;

  if (!PGHOST) {
    throw new Error('Database configuration missing: PGHOST or DATABASE_URL is required');
  }

  // 构建 PostgreSQL 连接字符串
  const password = PGPASSWORD ? `:${PGPASSWORD}` : '';
  return `postgresql://${PGUSER}${password}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
}

// 使用 Neon serverless driver - 自动连接池管理，适合 serverless 环境
const sql = neon(getDatabaseUrl());

export async function query(text: string, params?: any[]): Promise<any> {
  try {
    // 使用 Neon 的 query 方法处理参数化查询
    if (params && params.length > 0) {
      return await sql.query(text, params);
    } else {
      // 无参数的查询直接执行
      return await sql.query(text);
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}