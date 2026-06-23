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
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '200');

  const redis = new Redis(process.env.REDIS_URL!, { lazyConnect: true, enableOfflineQueue: false });
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

  try {
    await redis.connect();

    // 获取一批文章
    const rows = await sql.query(
      `SELECT id, type, short_title, site, title, description, img, author, published_time, modified_time, body, url, language
       FROM articles
       WHERE site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    if (!rows || rows.length === 0) {
      await redis.disconnect();
      return NextResponse.json({ ok: true, refreshed: 0, offset, total: 0 });
    }

    let refreshed = 0;
    for (const row of rows) {
      const key = `article:${row.type}:${row.short_title}`;
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
      await redis.set(key, JSON.stringify(article));
      refreshed++;
    }

    await redis.disconnect();
    return NextResponse.json({
      ok: true,
      refreshed,
      offset,
      nextOffset: offset + limit,
      processed: rows.length,
    });

  } catch (e: any) {
    await redis.disconnect();
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
