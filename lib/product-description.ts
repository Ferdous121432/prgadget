export type ProductDescriptionBlockType =
  | "heading"
  | "paragraph"
  | "callout"
  | "list"
  | "feature-grid"
  | "split"
  | "button-link"
  | "image";

type ProductDescriptionFeatureItem = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

type HeadingBlock = {
  id: string;
  type: "heading";
  eyebrow: string;
  title: string;
  body: string;
};

type ParagraphBlock = {
  id: string;
  type: "paragraph";
  body: string;
};

type CalloutBlock = {
  id: string;
  type: "callout";
  eyebrow: string;
  title: string;
  body: string;
};

type ListBlock = {
  id: string;
  type: "list";
  title: string;
  items: string[];
};

type FeatureGridBlock = {
  id: string;
  type: "feature-grid";
  items: ProductDescriptionFeatureItem[];
};

type SplitBlock = {
  id: string;
  type: "split";
  leftTitle: string;
  leftBody: string;
  rightTitle: string;
  rightBody: string;
};

type ButtonLinkBlock = {
  id: string;
  type: "button-link";
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt: string;
  caption: string;
};

export type ProductDescriptionBlock =
  | HeadingBlock
  | ParagraphBlock
  | CalloutBlock
  | ListBlock
  | FeatureGridBlock
  | SplitBlock
  | ButtonLinkBlock
  | ImageBlock;

export type ProductDescriptionDocument = {
  version: 1;
  blocks: ProductDescriptionBlock[];
};

const PRODUCT_DESCRIPTION_VERSION = 1;

const HTML_ENTITY_MAP: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
};

function decodeHtmlEntities(input: string) {
  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const normalizedEntity = String(entity).toLowerCase();

    if (normalizedEntity in HTML_ENTITY_MAP) {
      return HTML_ENTITY_MAP[normalizedEntity];
    }

    if (normalizedEntity.startsWith("#x")) {
      const codePoint = Number.parseInt(normalizedEntity.slice(2), 16);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    if (normalizedEntity.startsWith("#")) {
      const codePoint = Number.parseInt(normalizedEntity.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }

    return match;
  });
}

function stripMarkdownTokens(input: string) {
  return input
    .replace(/```([\s\S]*?)```/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1$2")
    .replace(/(^|[^_])_([^_]+)_(?!_)/g, "$1$2")
    .replace(/~~([^~]+)~~/g, "$1");
}

function createBlockId() {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFeatureItem(
  value: unknown,
): ProductDescriptionFeatureItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const item: ProductDescriptionFeatureItem = {
    id: normalizeText(source.id) || createBlockId(),
    eyebrow: normalizeText(source.eyebrow),
    title: normalizeText(source.title),
    body: normalizeText(source.body),
  };

  return item.title || item.body || item.eyebrow ? item : null;
}

function normalizeBlock(value: unknown): ProductDescriptionBlock | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const id = normalizeText(source.id) || createBlockId();
  const type = normalizeText(source.type) as ProductDescriptionBlockType;

  switch (type) {
    case "heading": {
      const block: HeadingBlock = {
        id,
        type,
        eyebrow: normalizeText(source.eyebrow),
        title: normalizeText(source.title),
        body: normalizeText(source.body),
      };
      return block.title || block.body || block.eyebrow ? block : null;
    }
    case "paragraph": {
      const block: ParagraphBlock = {
        id,
        type,
        body: normalizeText(source.body),
      };
      return block.body ? block : null;
    }
    case "callout": {
      const block: CalloutBlock = {
        id,
        type,
        eyebrow: normalizeText(source.eyebrow),
        title: normalizeText(source.title),
        body: normalizeText(source.body),
      };
      return block.title || block.body || block.eyebrow ? block : null;
    }
    case "list": {
      const block: ListBlock = {
        id,
        type,
        title: normalizeText(source.title),
        items: (Array.isArray(source.items) ? source.items : [])
          .map((item) => normalizeText(item))
          .filter(Boolean),
      };
      return block.title || block.items.length > 0 ? block : null;
    }
    case "feature-grid": {
      const block: FeatureGridBlock = {
        id,
        type,
        items: (Array.isArray(source.items) ? source.items : [])
          .map((item) => normalizeFeatureItem(item))
          .filter((item): item is ProductDescriptionFeatureItem =>
            Boolean(item),
          ),
      };
      return block.items.length > 0 ? block : null;
    }
    case "split": {
      const block: SplitBlock = {
        id,
        type,
        leftTitle: normalizeText(source.leftTitle),
        leftBody: normalizeText(source.leftBody),
        rightTitle: normalizeText(source.rightTitle),
        rightBody: normalizeText(source.rightBody),
      };
      return block.leftTitle ||
        block.leftBody ||
        block.rightTitle ||
        block.rightBody
        ? block
        : null;
    }
    case "button-link": {
      const block: ButtonLinkBlock = {
        id,
        type,
        label: normalizeText(source.label),
        href: normalizeText(source.href),
        variant:
          normalizeText(source.variant) === "secondary"
            ? "secondary"
            : "primary",
      };
      return block.label && block.href ? block : null;
    }
    case "image": {
      const block: ImageBlock = {
        id,
        type,
        src: normalizeText(source.src),
        alt: normalizeText(source.alt),
        caption: normalizeText(source.caption),
      };
      return block.src ? block : null;
    }
    default:
      return null;
  }
}

function normalizeDocument(value: unknown): ProductDescriptionDocument | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;

  if (!Array.isArray(source.blocks)) {
    return null;
  }

  return {
    version: PRODUCT_DESCRIPTION_VERSION,
    blocks: source.blocks
      .map((block) => normalizeBlock(block))
      .filter((block): block is ProductDescriptionBlock => Boolean(block)),
  };
}

export function createEmptyProductDescriptionBlock(
  type: ProductDescriptionBlockType,
): ProductDescriptionBlock {
  switch (type) {
    case "heading":
      return { id: createBlockId(), type, eyebrow: "", title: "", body: "" };
    case "paragraph":
      return { id: createBlockId(), type, body: "" };
    case "callout":
      return { id: createBlockId(), type, eyebrow: "", title: "", body: "" };
    case "list":
      return { id: createBlockId(), type, title: "", items: [""] };
    case "feature-grid":
      return {
        id: createBlockId(),
        type,
        items: [{ id: createBlockId(), eyebrow: "", title: "", body: "" }],
      };
    case "split":
      return {
        id: createBlockId(),
        type,
        leftTitle: "",
        leftBody: "",
        rightTitle: "",
        rightBody: "",
      };
    case "button-link":
      return {
        id: createBlockId(),
        type,
        label: "",
        href: "",
        variant: "primary",
      };
    case "image":
      return { id: createBlockId(), type, src: "", alt: "", caption: "" };
  }
}

export function createEmptyProductDescriptionDocument(): ProductDescriptionDocument {
  return {
    version: PRODUCT_DESCRIPTION_VERSION,
    blocks: [createEmptyProductDescriptionBlock("paragraph")],
  };
}

export function parseProductDescriptionDocument(
  input?: string | null,
): ProductDescriptionDocument | null {
  if (!input?.trim()) {
    return null;
  }

  try {
    return normalizeDocument(JSON.parse(input));
  } catch {
    return null;
  }
}

export function serializeProductDescriptionDocument(
  document: ProductDescriptionDocument,
) {
  const normalized = normalizeDocument(document);

  if (!normalized || normalized.blocks.length === 0) {
    return "";
  }

  return JSON.stringify(normalized);
}

function stripLegacyDescriptionToStructuredText(input?: string | null) {
  if (!input?.trim()) {
    return "";
  }

  const plainText = decodeHtmlEntities(input)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/<\/?[A-Z][A-Za-z0-9._:-]*(\s[^>]*)?>/g, " ")
    .replace(/\{[^{}]*\}/g, " ")
    .replace(/\r/g, "")
    .trim();

  return stripMarkdownTokens(plainText)
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isLegacyHtmlDescription(input?: string | null) {
  if (!input?.trim()) {
    return false;
  }

  return /<\/?[a-z][^>]*>/i.test(input);
}

function convertLegacyDescriptionToDocument(
  input?: string | null,
): ProductDescriptionDocument {
  const plainText = stripLegacyDescriptionToStructuredText(input);
  const blocks = plainText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph): ProductDescriptionBlock => ({
        id: createBlockId(),
        type: "paragraph",
        body: paragraph,
      }),
    );

  return {
    version: PRODUCT_DESCRIPTION_VERSION,
    blocks,
  };
}

export function getEditableProductDescriptionDocument(
  input?: string | null,
): ProductDescriptionDocument {
  const parsed = parseProductDescriptionDocument(input);

  if (parsed?.blocks.length) {
    return parsed;
  }

  const legacyDocument = convertLegacyDescriptionToDocument(input);

  return legacyDocument.blocks.length > 0
    ? legacyDocument
    : createEmptyProductDescriptionDocument();
}

export function getRenderableProductDescriptionDocument(
  input?: string | null,
): ProductDescriptionDocument | null {
  const parsed = parseProductDescriptionDocument(input);

  if (parsed?.blocks.length) {
    return parsed;
  }

  if (!input?.trim() || isLegacyHtmlDescription(input)) {
    return null;
  }

  const legacyDocument = convertLegacyDescriptionToDocument(input);
  return legacyDocument.blocks.length > 0 ? legacyDocument : null;
}

export function normalizeProductDescriptionBlocks(input?: string | null) {
  if (!input?.trim()) {
    return "";
  }

  const parsed = parseProductDescriptionDocument(input);

  if (parsed) {
    return serializeProductDescriptionDocument(parsed);
  }

  return serializeProductDescriptionDocument(
    convertLegacyDescriptionToDocument(input),
  );
}

export function stripProductDescriptionToText(input?: string | null): string {
  const parsed = parseProductDescriptionDocument(input);

  if (parsed) {
    return parsed.blocks
      .flatMap((block) => {
        switch (block.type) {
          case "heading":
            return [block.eyebrow, block.title, block.body];
          case "paragraph":
            return [block.body];
          case "callout":
            return [block.eyebrow, block.title, block.body];
          case "list":
            return [block.title, ...block.items];
          case "feature-grid":
            return block.items.flatMap((item) => [
              item.eyebrow,
              item.title,
              item.body,
            ]);
          case "split":
            return [
              block.leftTitle,
              block.leftBody,
              block.rightTitle,
              block.rightBody,
            ];
          case "button-link":
            return [block.label];
          case "image":
            return [block.alt, block.caption];
          default:
            return [];
        }
      })
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ");
  }

  return stripLegacyDescriptionToStructuredText(input)
    .replace(/\s+/g, " ")
    .trim();
}
