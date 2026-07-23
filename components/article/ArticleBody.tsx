interface ArticleBodyProps {
  body: string;
}

function addHeadingIds(html: string): string {
  return html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<h2${attrs} id="${id}">${content}</h2>`;
  });
}

// Strip font-size and min-width from a CSS declaration block
function stripProps(decl: string): string {
  return decl
    .replace(/\bfont-size\s*:[^;]+;?/gi, '')
    .replace(/\bmin-width\s*:[^;]+;?/gi, '');
}

function scopeStyles(html: string): string {
  return html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match, css: string) => {
    const scoped = css.replace(
      /([^{}@/]+)\{([^}]*)\}/g,
      (_rule: string, selectors: string, decl: string) => {
        const scopedSelectors = selectors
          .split(',')
          .map((s: string) => {
            const t = s.trim();
            if (!t || t.startsWith('@') || t.startsWith('from') || t.startsWith('to') || /^\d/.test(t)) return s;
            if (t === 'body' || t === 'html' || t === ':root') return '';
            return `.article-content ${t}`;
          })
          .filter(Boolean)
          .join(',');
        if (!scopedSelectors.trim()) return '';
        return scopedSelectors + '{' + stripProps(decl) + '}';
      }
    );
    return `<style>${scoped}</style>`;
  });
}

// Wrap bare tables (not already inside .tableContainer) with a scrollable div
function wrapTables(html: string): string {
  return html.replace(/(<table[\s\S]*?<\/table>)/gi, (match) => {
    return `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%">${match}</div>`;
  });
}

// Replace alicdn.com images (from Alibaba import) with Unsplash placeholders
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909172-8c2f3e8f7e48?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909190-eccf4a8bf97c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909195-2b8f4e9b6f4c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909202-f1e1d3e8f7a0?w=800&h=600&fit=crop',
];

function replaceAlicdnImages(html: string): string {
  let idx = 0;
  return html.replace(
    /https?:\/\/[a-z0-9.-]*alicdn\.com\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/gi,
    () => {
      const img = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
      idx++;
      return img;
    }
  );
}

export function ArticleBody({ body }: ArticleBodyProps) {
  const processed = replaceAlicdnImages(wrapTables(scopeStyles(addHeadingIds(body))));
  return (
    <div className="article-content" dangerouslySetInnerHTML={{ __html: processed }} />
  );
}
