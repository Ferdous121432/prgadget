export function normalizeMalformedRichText(input: string) {
  let normalized = input.trim();
  let previous = "";

  while (normalized !== previous) {
    previous = normalized;

    normalized = normalized
      .replace(
        /<(h[2-4]|p|blockquote)>\s*<(ul|ol)([^>]*)>/gi,
        (_match, _blockTag: string, listTag: string, attributes: string) =>
          `<${listTag}${attributes}>`,
      )
      .replace(
        /<\/(ul|ol)>\s*<\/(h[2-4]|p|blockquote)>/gi,
        (_match, listTag: string) => `</${listTag}>`,
      )
      .replace(
        /^<(ul|ol)[^>]*>\s*<li>\s*(<(ul|ol)[^>]*>[\s\S]*<\/\3>)\s*<\/li>\s*<\/\1>$/i,
        (_match, _outerListTag: string, innerList: string) => innerList,
      );
  }

  return normalized;
}
