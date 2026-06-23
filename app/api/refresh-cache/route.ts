import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { neon } from '@neondatabase/serverless';

function formatDate(date: any): string | null {
  if (!date) return null;
  if (typeof date === 'object' && typeof date.toISOString === 'function') {
    return date.toISOString().split('T')[0];
  }
  const str = String(date);
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const slug = request.nextUrl.searchParams.get('slug');

  if (!type || !slug) {
    return NextResponse.json({ error: 'type and slug required' }, { status: 400 });
  }

  const key = `article:${type}:${slug}`;
  const redis = new Redis(process.env.REDIS_URL!, { lazyConnect: true, enableOfflineQueue: false });
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

  try {
    await redis.connect();

    // 1. 删旧缓存
    await redis.del(key);

    // 2. 从 DB 重新读取
    const rows = await sql.query(
      `SELECT * FROM articles WHERE type = $1 AND short_title = $2 AND site = 'thelivinglook' LIMIT 1`,
      [type, slug]
    );

    if (!rows || rows.length === 0) {
      await redis.disconnect();
      return NextResponse.json({ error: 'article not found', key }, { status: 404 });
    }

    const row = rows[0];
    const article = {
      id: row.id,
      slug: row.short_title,
      site: row.site,
      type: row.type,
      title: row.title,
      description: row.description,
      img: row.img,
      author: row.author,
      publishDate: formatDate(row.published_time),
      body: row.body,
      url: row.url,
      language: row.language,
      updatedAt: row.modified_time ? formatDate(row.modified_time) ?? undefined : undefined,
    };

    // 3. 写入新缓存
    await redis.set(key, JSON.stringify(article));

    // 4. 验证
    const verify = await redis.get(key);
    const verifyObj = verify ? JSON.parse(verify) : null;

    await redis.disconnect();
    return NextResponse.json({
      ok: true,
      key,
      publishDate: article.publishDate,
      verified: verifyObj?.publishDate,
    });

  } catch (e: any) {
    await redis.disconnect();
    return NextResponse.json({ error: e.message, key }, { status: 500 });
  }
}
