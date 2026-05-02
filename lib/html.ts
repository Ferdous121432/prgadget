import rehypeParse from "rehype-parse";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import "server-only";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import {
  getHtmlTextExcerpt as getClientSafeHtmlTextExcerpt,
  stripHtmlToText,
} from "./html-text";
import { normalizeMalformedRichText } from "./rich-text";

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

const richTextSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...RICH_TEXT_ALLOWED_TAGS],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title", "target", "rel"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
  },
} as any;

function normalizeEditorBlockTags(input: string) {
  return input.replace(/<div\b[^>]*>/gi, "<p>").replace(/<\/div>/gi, "</p>");
}

function hardenLinks() {
  return (tree: unknown) => {
    visit(tree, "element", (node: any) => {
      if (node.tagName !== "a") {
        return;
      }

      const href = node.properties?.href;

      if (typeof href !== "string" || href.length === 0) {
        if (node.properties) {
          delete node.properties.target;
          delete node.properties.rel;
        }
        return;
      }

      node.properties = {
        ...node.properties,
        target: "_blank",
        rel: "nofollow noopener noreferrer",
      };
    });
  };
}

function createHtmlProcessor() {
  return unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSanitize, richTextSanitizeSchema)
    .use(hardenLinks)
    .use(rehypeStringify);
}

/**
 * Sanitize rich HTML for safe DB storage and rendering.
 * - Only a strict allowlist of tags and attributes is kept.
 * - All links are hardened with target="_blank" and
 *   rel="nofollow noopener noreferrer".
 */
export function sanitizeRichTextHtml(input?: string | null): string {
  if (!input?.trim()) return "";

  const normalizedInput = normalizeMalformedRichText(
    normalizeEditorBlockTags(input),
  );

  const sanitized = String(
    createHtmlProcessor().processSync(normalizedInput),
  ).trim();

  return sanitized === "<p></p>" || sanitized === "<p><br /></p>"
    ? ""
    : sanitized;
}

/**
 * Strip all HTML tags and return plain text.
 * Used for search indexing and excerpt generation.
 */
export function stripHtml(input?: string | null): string {
  return stripHtmlToText(input);
}

/**
 * Return a plain-text excerpt of at most `maxLength` characters,
 * truncating at a word boundary where possible.
 */
export function getHtmlTextExcerpt(
  input?: string | null,
  maxLength = 140,
): string {
  return getClientSafeHtmlTextExcerpt(input, maxLength);
}
