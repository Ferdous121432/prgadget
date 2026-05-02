# PRGadget

PRGadget is a Next.js ecommerce application with App Router, Prisma, NextAuth, Redis-backed caching, admin management screens, and a storefront product catalog.

This README focuses on the parts of the codebase that are easy to forget later, especially the block-based product description system used by the admin product form and the public product page.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run typechecking:

```bash
npm run typecheck
```

Useful Prisma commands:

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

Open http://localhost:3000 in the browser after the dev server starts.

## App Notes

- Storefront routes live under `app/(root)`.
- Auth routes live under `app/(auth)`.
- Admin routes live under `admin` and `app/admin` surfaces.
- Server-side product create/update logic lives in `lib/actions/product.actions.ts`.
- Prisma schema lives in `prisma/schema.prisma`.

## Block-Based Product Descriptions

Product descriptions use a structured JSON document instead of raw HTML and CSS. The goal is to let admins build richer product storytelling sections while keeping rendering stable, consistent, and safe.

### Why This Exists

Allowing arbitrary HTML and CSS inside product descriptions makes layout fragile and hard to maintain. The block-based approach stores content as typed data and lets the application render each block with fixed React and Tailwind UI.

This gives the admin controlled flexibility without allowing unrestricted markup to alter the rest of the page.

### Source Of Truth

The description schema and helpers live in `lib/product-description.ts`.

Key exported symbols:

- `ProductDescriptionBlockType`
- `ProductDescriptionBlock`
- `ProductDescriptionDocument`
- `parseProductDescriptionDocument`
- `serializeProductDescriptionDocument`
- `getEditableProductDescriptionDocument`
- `getRenderableProductDescriptionDocument`
- `normalizeProductDescriptionBlocks`
- `stripProductDescriptionToText`

### Document Shape

Descriptions are stored in the existing `product.description` string field as serialized JSON.

Current document format:

```json
{
  "version": 1,
  "blocks": [
    {
      "id": "block-id",
      "type": "heading",
      "eyebrow": "Performance",
      "title": "Built for everyday speed",
      "body": "Fast app launches and smooth multitasking."
    }
  ]
}
```

The `version` field allows future schema evolution without changing the storage model.

### Supported Block Types

The current implementation supports these block types:

| Type           | Purpose                    | Main fields                                        |
| -------------- | -------------------------- | -------------------------------------------------- |
| `heading`      | Section intro or hero copy | `eyebrow`, `title`, `body`                         |
| `paragraph`    | Standard body text         | `body`                                             |
| `callout`      | Highlighted content box    | `eyebrow`, `title`, `body`                         |
| `list`         | Bullet list section        | `title`, `items[]`                                 |
| `feature-grid` | Grid of feature cards      | `items[]` with `eyebrow`, `title`, `body`          |
| `split`        | Two-column content block   | `leftTitle`, `leftBody`, `rightTitle`, `rightBody` |
| `button-link`  | CTA button                 | `label`, `href`, `variant`                         |
| `image`        | Single media block         | `src`, `alt`, `caption`                            |

If a block is empty or invalid, normalization drops it instead of saving malformed content.

### Admin Authoring Flow

The product form mounts the description editor from `components/admin/product-form/Description.tsx`.

The actual builder UI lives in `components/admin/product-form/DescriptionBuilder.tsx`.

Current editor behavior:

- Add a block from the supported block type list.
- Change a block from one type to another.
- Move blocks up or down.
- Remove blocks.
- Fill only the fields that belong to the chosen block type.
- Edit nested feature cards inside `feature-grid` blocks.

If the existing description is not already block JSON, the editor treats it as legacy content and shows a warning that saving will convert it into structured blocks.

### Save And Normalization Flow

Product persistence happens in `lib/actions/product.actions.ts`.

On both create and update, the description passes through `normalizeProductDescriptionBlocks` before being written to the database.

Current save behavior:

- If the input is already a valid block document, it is normalized and re-serialized.
- If the input is legacy plain text or old content, it is converted into paragraph blocks.
- Empty documents serialize to an empty string.
- Invalid or empty blocks are removed during normalization.

This means the database gradually converges toward the block format even if older records still exist.

### Storefront Rendering Flow

The public product page uses `components/shared/product/product-description-content.tsx`.

Rendering behavior:

- `getRenderableProductDescriptionDocument` tries to parse the saved block document.
- If parsing succeeds, each block is rendered through a fixed React render path.
- Each block type maps to a specific Tailwind-styled UI section.
- Internal links and external links are handled safely by the renderer.

The product page itself uses this component from `app/(root)/product/[slug]/page.tsx`.

### Legacy Compatibility

The current implementation preserves older data instead of hard-breaking it.

Compatibility behavior:

- Existing HTML descriptions are detected with `isLegacyHtmlDescription`.
- Legacy HTML still renders through the older sanitized HTML path.
- Legacy plain text can be converted into paragraph blocks when loaded into the editor and then saved.
- `stripProductDescriptionToText` supports both block JSON and legacy content so excerpts and search text keep working.

### How To Add A New Block Type

When introducing a new block type, update all three surfaces below:

1. Schema and normalization in `lib/product-description.ts`
2. Admin editing UI in `components/admin/product-form/DescriptionBuilder.tsx`
3. Storefront rendering in `components/shared/product/product-description-content.tsx`

If one of those three is missing, the feature will be incomplete.

### Maintenance Notes

- Keep this README updated whenever `ProductDescriptionBlockType` changes.
- Keep this README updated if the document version changes from `version: 1`.
- Keep this README updated if legacy conversion rules or fallback rendering behavior change.
- Prefer adding a new block type over allowing arbitrary custom HTML or CSS in product descriptions.

## Future Reference

If you are revisiting this code later, start here:

- `lib/product-description.ts` for data shape and migration behavior
- `components/admin/product-form/DescriptionBuilder.tsx` for authoring workflow
- `components/shared/product/product-description-content.tsx` for rendering behavior
- `lib/actions/product.actions.ts` for save-time normalization
