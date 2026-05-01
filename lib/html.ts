import sanitizeHtml from "sanitize-html";

// Tags allowed in stored rich product descriptions
const RICH_TEXT_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "a",
] as const;

/**
 * Sanitize rich HTML for safe DB storage and rendering.
 * - Only a strict allowlist of tags and attributes is kept.
 * - All links are hardened with target="_blank" and
 *   rel="nofollow noopener noreferrer".
 */
export function sanitizeRichTextHtml(input?: string | null): string {
  if (!input?.trim()) return "";

  const sanitized = sanitizeHtml(input, {
    allowedTags: [...RICH_TEXT_ALLOWED_TAGS],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "nofollow noopener noreferrer",
      }),
    },
  }).trim();

  return sanitized === "<p></p>" ? "" : sanitized;
}

/**
 * Strip all HTML tags and return plain text.
 * Used for search indexing and excerpt generation.
 */
export function stripHtml(input?: string | null): string {
  if (!input?.trim()) return "";

  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Return a plain-text excerpt of at most `maxLength` characters,
 * truncating at a word boundary where possible.
 */
export function getHtmlTextExcerpt(
  input?: string | null,
  maxLength = 140,
): string {
  const plainText = stripHtml(input);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const clipped = plainText.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const excerptEnd =
    lastSpace > Math.floor(maxLength * 0.6) ? lastSpace : maxLength;

  return `${clipped.slice(0, excerptEnd).trimEnd()}...`;
}
