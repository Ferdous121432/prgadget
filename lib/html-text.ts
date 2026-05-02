import { stripProductDescriptionToText } from "./product-description";

export function stripHtmlToText(input?: string | null): string {
  return stripProductDescriptionToText(input);
}

export function getHtmlTextExcerpt(
  input?: string | null,
  maxLength = 140,
): string {
  const plainText = stripHtmlToText(input);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const clipped = plainText.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const excerptEnd =
    lastSpace > Math.floor(maxLength * 0.6) ? lastSpace : maxLength;

  return `${clipped.slice(0, excerptEnd).trimEnd()}...`;
}
