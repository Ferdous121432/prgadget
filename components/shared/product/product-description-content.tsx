import { Card, CardContent } from "@/components/ui/card";
import { sanitizeRichTextHtml } from "@/lib/html";
import {
  getRenderableProductDescriptionDocument,
  isLegacyHtmlDescription,
  type ProductDescriptionBlock,
} from "@/lib/product-description";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ProductDescriptionContentProps = {
  source: string;
  className?: string;
};

function DescriptionLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const className = cn(
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
    variant === "secondary"
      ? "border border-border bg-background text-foreground hover:bg-muted"
      : "bg-primary text-primary-foreground hover:bg-primary/85",
  );

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer nofollow">
      {label}
    </a>
  );
}

function renderBlock(block: ProductDescriptionBlock) {
  switch (block.type) {
    case "heading":
      return (
        <section key={block.id} className="space-y-3">
          {block.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {block.eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {block.title}
          </h2>
          {block.body ? (
            <p className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
              {block.body}
            </p>
          ) : null}
        </section>
      );
    case "paragraph":
      return (
        <p
          key={block.id}
          className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
          {block.body}
        </p>
      );
    case "callout":
      return (
        <section
          key={block.id}
          className="rounded-3xl border border-primary/15 bg-primary/5 px-6 py-5">
          {block.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/70">
              {block.eyebrow}
            </p>
          ) : null}
          {block.title ? (
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {block.title}
            </h3>
          ) : null}
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {block.body}
          </p>
        </section>
      );
    case "list":
      return (
        <section key={block.id} className="space-y-3">
          {block.title ? (
            <h3 className="text-lg font-semibold">{block.title}</h3>
          ) : null}
          <ul className="list-disc space-y-2 pl-6 text-sm leading-7 text-muted-foreground">
            {block.items.map((item, index) => (
              <li key={`${block.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      );
    case "feature-grid":
      return (
        <section
          key={block.id}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {block.items.map((item) => (
            <Card
              key={item.id}
              className="border-border/70 bg-card/70 shadow-none">
              <CardContent className="space-y-3 p-5">
                {item.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {item.eyebrow}
                  </p>
                ) : null}
                {item.title ? (
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                ) : null}
                <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      );
    case "split":
      return (
        <section
          key={block.id}
          className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-3">
            {block.leftTitle ? (
              <h3 className="text-lg font-semibold">{block.leftTitle}</h3>
            ) : null}
            {block.leftBody ? (
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {block.leftBody}
              </p>
            ) : null}
          </div>
          <div className="space-y-3">
            {block.rightTitle ? (
              <h3 className="text-lg font-semibold">{block.rightTitle}</h3>
            ) : null}
            {block.rightBody ? (
              <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {block.rightBody}
              </p>
            ) : null}
          </div>
        </section>
      );
    case "button-link":
      return (
        <div key={block.id}>
          <DescriptionLink
            href={block.href}
            label={block.label}
            variant={block.variant}
          />
        </div>
      );
    case "image":
      return (
        <figure key={block.id} className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt || "Product description image"}
            className="w-full rounded-3xl border border-border/70 object-cover"
            loading="lazy"
          />
          {block.caption ? (
            <figcaption className="text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    default:
      return null;
  }
}

export default function ProductDescriptionContent({
  source,
  className,
}: ProductDescriptionContentProps) {
  const document = getRenderableProductDescriptionDocument(source);

  if (document) {
    return (
      <div className={cn("space-y-6", className)}>
        {document.blocks.map((block) => renderBlock(block))}
      </div>
    );
  }

  if (!source?.trim()) {
    return null;
  }

  if (isLegacyHtmlDescription(source)) {
    return (
      <div
        className={cn("html-content", className)}
        dangerouslySetInnerHTML={{
          __html: sanitizeRichTextHtml(source),
        }}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {source
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 16)}`}
            className="text-sm leading-7 text-muted-foreground whitespace-pre-line">
            {paragraph}
          </p>
        ))}
    </div>
  );
}
