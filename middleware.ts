import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // 文章页：缓存 24 小时
  if (pathname.match(/^\/[^/]+\/[^/]+$/)) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=604800'
    );
  }
  // 分类页：缓存 1 小时
  else if (pathname.match(/^\/[^/]+$/) && !pathname.startsWith('/_')) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );
  }

  return response;
}

export const config = {
  matcher: ['/:category/:slug', '/:category'],
};
