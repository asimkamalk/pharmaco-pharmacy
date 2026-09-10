/**
 * Lightweight HTML sanitizer for product/CMS rich text.
 * Avoids isomorphic-dompurify/jsdom, which often crashes on Vercel serverless.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "hr",
  "span",
]);

const VOID_TAGS = new Set(["br", "hr"]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeUrl(raw: string): string | null {
  const href = raw.trim().replace(/^['"]|['"]$/g, "");
  if (!href) return null;
  const lower = href.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return null;
  }
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("/") ||
    lower.startsWith("#")
  ) {
    return href;
  }
  return null;
}

function sanitizeAttributes(tag: string, attrs: string): string {
  if (tag !== "a") return "";

  const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const href = sanitizeUrl(hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "");
  if (!href) return "";

  return ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
}

export function sanitizeProductHtml(html: string): string {
  if (!html?.trim()) return "";

  // Remove dangerous blocks entirely
  let cleaned = html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form)[^>]*\/?\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  cleaned = cleaned.replace(
    /<\/?([a-z0-9]+)([^>]*)\/?>/gi,
    (full, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      const isClosing = full.startsWith("</");
      if (!ALLOWED_TAGS.has(tag)) {
        return "";
      }
      if (isClosing) {
        return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
      }
      if (VOID_TAGS.has(tag)) {
        return `<${tag}>`;
      }
      const attrs = sanitizeAttributes(tag, rawAttrs || "");
      return `<${tag}${attrs}>`;
    },
  );

  return cleaned;
}
