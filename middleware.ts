import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Type → keyword mapping for showroom redirect
const SHOWROOM_MAP: Record<string, string> = {
  "kitchen-hacks": "kitchen-wall-cabinet-organizer",
  "closet-organization": "bamboo-folding-wardrobe",
  "eco-cleaning": "eco-friendly-all-purpose-cleaner-bulk",
  "plant-care": "foam-planters",
  "tech-efficiency": "bluetooth-rgb-led-smart-bulb",
  "laundry-secrets": "collapsible-laundry-storage",
};

const SHOWROOM_DEFAULT =
  "https://www.alibaba.com/showroom/home-storage-and-organization.html?ots=thelivinglook";

function getShowroomUrl(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const kw = SHOWROOM_MAP[segments[0]];
    if (kw)
      return `https://www.alibaba.com/showroom/${kw}.html?ots=thelivinglook`;
  }
  return SHOWROOM_DEFAULT;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // www → root
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;

  // ── Showroom redirect: 302 for non-bots only ──
  const cf = (request as any).cf;
  const bm = cf?.botManagement;
  const hasBotManagement = bm && bm.score !== undefined;

  let isBot = false;
  if (hasBotManagement) {
    isBot = bm.verifiedBot === true || bm.score < 30;
  } else {
    const ua = (request.headers.get("user-agent") || "").toLowerCase();
    const botPatterns = [
      "googlebot", "google-structured-data", "google-read-aloud",
      "google-safety", "mediapartners-google", "adsbot-google",
      "bingbot", "msnbot", "bingpreview",
      "yandex", "yandexbot", "yandeximages",
      "baiduspider", "baidu-image",
      "duckduckbot", "applebot", "applebot-extended",
      "yahoo", "slurp",
      "naver", "yeti", "naverbot",
      "sogou", "sogou web spider",
      "petalbot", "bytespider",
      "semrushbot", "semrush", "ahrefsbot", "ahrefs",
      "mj12bot", "dotbot", "rogerbot", "screaming frog",
      "lighthouse", "pagespeed", "gtmetrix", "pingdom",
      "facebookexternalhit", "facebookcatalog", "facebot",
      "twitterbot", "linkedinbot", "slackbot", "discordbot",
      "telegrambot", "whatsapp",
      "crawler", "spider", "bot/", "bot;", "bot-", "robot",
      "headlesschrome", "phantomjs", "puppeteer", "playwright",
      "selenium", "webdriver",
      "wget", "curl", "python-requests", "scrapy",
      "httpclient", "go-http-client", "node-fetch",
      "chatgpt-user",
      "hanaleibot", "brightbot", "yisou",
    ];
    isBot = botPatterns.some((p) => ua.includes(p));
  }

  if (!isBot) {
    const target = getShowroomUrl(pathname);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: target,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // Bots → normal page
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap|robots).*)"],
};
