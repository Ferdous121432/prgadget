"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createEmptyProductDescriptionBlock,
  getEditableProductDescriptionDocument,
  parseProductDescriptionDocument,
  serializeProductDescriptionDocument,
  type ProductDescriptionBlock,
  type ProductDescriptionBlockType,
  type ProductDescriptionDocument,
} from "@/lib/product-description";

const blockTypeOptions: Array<{
  value: ProductDescriptionBlockType;
  label: string;
}> = [
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraph" },
  { value: "callout", label: "Callout" },
  { value: "list", label: "Bullet list" },
  { value: "feature-grid", label: "Feature grid" },
  { value: "split", label: "Two column split" },
  { value: "button-link", label: "Button link" },
  { value: "image", label: "Image" },
];

function getBlockLabel(type: ProductDescriptionBlockType) {
  return (
    blockTypeOptions.find((option) => option.value === type)?.label ?? type
  );
}

function createEmptyFeatureItem() {
  const block = createEmptyProductDescriptionBlock("feature-grid");
  return block.type === "feature-grid"
    ? block.items[0]
    : { id: "", eyebrow: "", title: "", body: "" };
}

type DescriptionBuilderProps = {
  value?: string | null;
  onChange: (value: string) => void;
};

function createStarterDocument(): ProductDescriptionDocument {
  return {
    version: 1,
    blocks: [createEmptyProductDescriptionBlock("paragraph")],
  };
}

export default function DescriptionBuilder({
  value,
  onChange,
}: DescriptionBuilderProps) {
  const [document, setDocument] = React.useState<ProductDescriptionDocument>(
    () => getEditableProductDescriptionDocument(value),
  );

  const isLegacySource =
    Boolean(value?.trim()) && !parseProductDescriptionDocument(value);

  React.useEffect(() => {
    const nextDocument = getEditableProductDescriptionDocument(value);
    const nextSerialized = serializeProductDescriptionDocument(nextDocument);
    const currentSerialized = serializeProductDescriptionDocument(document);

    if (nextSerialized !== currentSerialized) {
      setDocument(nextDocument);
    }
  }, [value]);

  const updateDocument = React.useCallback(
    (
      updater: (
        current: ProductDescriptionDocument,
      ) => ProductDescriptionDocument,
    ) => {
      setDocument((current) => {
        const next = updater(current);
        onChange(serializeProductDescriptionDocument(next));
        return next;
      });
    },
    [onChange],
  );

  const updateBlock = React.useCallback(
    (
      blockId: string,
      updater: (block: ProductDescriptionBlock) => ProductDescriptionBlock,
    ) => {
      updateDocument((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.id === blockId ? updater(block) : block,
        ),
      }));
    },
    [updateDocument],
  );

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    updateDocument((current) => {
      const index = current.blocks.findIndex((block) => block.id === blockId);

      if (index < 0) {
        return current;
      }

      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.blocks.length) {
        return current;
      }

      const blocks = [...current.blocks];
      const [movedBlock] = blocks.splice(index, 1);
      blocks.splice(targetIndex, 0, movedBlock);

      return {
        ...current,
        blocks,
      };
    });
  };

  const replaceBlockType = (
    blockId: string,
    type: ProductDescriptionBlockType,
  ) => {
    updateDocument((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === blockId
          ? { ...createEmptyProductDescriptionBlock(type), id: block.id }
          : block,
      ),
    }));
  };

  const addBlock = (type: ProductDescriptionBlockType) => {
    updateDocument((current) => ({
      ...current,
      blocks: [...current.blocks, createEmptyProductDescriptionBlock(type)],
    }));
  };

  const removeBlock = (blockId: string) => {
    updateDocument((current) => {
      const remainingBlocks = current.blocks.filter(
        (block) => block.id !== blockId,
      );

      return remainingBlocks.length > 0
        ? {
            ...current,
            blocks: remainingBlocks,
          }
        : createStarterDocument();
    });
  };

  return (
    <div className="space-y-4">
      {isLegacySource ? (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          This product already has a legacy HTML or text description. Editing
          and saving here will convert it into structured blocks.
        </div>
      ) : null}

      {document.blocks.map((block, index) => (
        <div
          key={block.id}
          className="space-y-4 rounded-2xl border border-border/70 bg-card/50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                Block {index + 1}: {getBlockLabel(block.type)}
              </span>
              <Select
                value={block.type}
                onValueChange={(nextType) =>
                  replaceBlockType(
                    block.id,
                    nextType as ProductDescriptionBlockType,
                  )
                }>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Choose block type" />
                </SelectTrigger>
                <SelectContent>
                  {blockTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveBlock(block.id, -1)}>
                Move up
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveBlock(block.id, 1)}>
                Move down
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeBlock(block.id)}>
                Remove
              </Button>
            </div>
          </div>

          {block.type === "heading" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Eyebrow
                </label>
                <Input
                  value={block.eyebrow}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "heading"
                        ? { ...current, eyebrow: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Title
                </label>
                <Input
                  value={block.title}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "heading"
                        ? { ...current, title: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Body
                </label>
                <Textarea
                  value={block.body}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "heading"
                        ? { ...current, body: event.target.value }
                        : current,
                    )
                  }
                  className="min-h-28"
                />
              </div>
            </div>
          ) : null}

          {block.type === "paragraph" ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Paragraph
              </label>
              <Textarea
                value={block.body}
                onChange={(event) =>
                  updateBlock(block.id, (current) =>
                    current.type === "paragraph"
                      ? { ...current, body: event.target.value }
                      : current,
                  )
                }
                className="min-h-32"
              />
            </div>
          ) : null}

          {block.type === "callout" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Eyebrow
                </label>
                <Input
                  value={block.eyebrow}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "callout"
                        ? { ...current, eyebrow: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Title
                </label>
                <Input
                  value={block.title}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "callout"
                        ? { ...current, title: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Body
                </label>
                <Textarea
                  value={block.body}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "callout"
                        ? { ...current, body: event.target.value }
                        : current,
                    )
                  }
                  className="min-h-28"
                />
              </div>
            </div>
          ) : null}

          {block.type === "list" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Title
                </label>
                <Input
                  value={block.title}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "list"
                        ? { ...current, title: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Items, one per line
                </label>
                <Textarea
                  value={block.items.join("\n")}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "list"
                        ? {
                            ...current,
                            items: event.target.value.split("\n"),
                          }
                        : current,
                    )
                  }
                  className="min-h-28"
                />
              </div>
            </div>
          ) : null}

          {block.type === "feature-grid" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Feature cards
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateBlock(block.id, (current) =>
                      current.type === "feature-grid"
                        ? {
                            ...current,
                            items: [...current.items, createEmptyFeatureItem()],
                          }
                        : current,
                    )
                  }>
                  Add feature
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {block.items.map((item) => (
                  <div
                    key={item.id}
                    className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateBlock(block.id, (current) =>
                            current.type === "feature-grid"
                              ? {
                                  ...current,
                                  items: current.items.filter(
                                    (feature) => feature.id !== item.id,
                                  ),
                                }
                              : current,
                          )
                        }>
                        Remove feature
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Eyebrow
                      </label>
                      <Input
                        value={item.eyebrow}
                        onChange={(event) =>
                          updateBlock(block.id, (current) =>
                            current.type === "feature-grid"
                              ? {
                                  ...current,
                                  items: current.items.map((feature) =>
                                    feature.id === item.id
                                      ? {
                                          ...feature,
                                          eyebrow: event.target.value,
                                        }
                                      : feature,
                                  ),
                                }
                              : current,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Title
                      </label>
                      <Input
                        value={item.title}
                        onChange={(event) =>
                          updateBlock(block.id, (current) =>
                            current.type === "feature-grid"
                              ? {
                                  ...current,
                                  items: current.items.map((feature) =>
                                    feature.id === item.id
                                      ? {
                                          ...feature,
                                          title: event.target.value,
                                        }
                                      : feature,
                                  ),
                                }
                              : current,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        Body
                      </label>
                      <Textarea
                        value={item.body}
                        onChange={(event) =>
                          updateBlock(block.id, (current) =>
                            current.type === "feature-grid"
                              ? {
                                  ...current,
                                  items: current.items.map((feature) =>
                                    feature.id === item.id
                                      ? { ...feature, body: event.target.value }
                                      : feature,
                                  ),
                                }
                              : current,
                          )
                        }
                        className="min-h-28"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {block.type === "split" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Left title
                  </label>
                  <Input
                    value={block.leftTitle}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "split"
                          ? { ...current, leftTitle: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Left body
                  </label>
                  <Textarea
                    value={block.leftBody}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "split"
                          ? { ...current, leftBody: event.target.value }
                          : current,
                      )
                    }
                    className="min-h-28"
                  />
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Right title
                  </label>
                  <Input
                    value={block.rightTitle}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "split"
                          ? { ...current, rightTitle: event.target.value }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Right body
                  </label>
                  <Textarea
                    value={block.rightBody}
                    onChange={(event) =>
                      updateBlock(block.id, (current) =>
                        current.type === "split"
                          ? { ...current, rightBody: event.target.value }
                          : current,
                      )
                    }
                    className="min-h-28"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {block.type === "button-link" ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Label
                </label>
                <Input
                  value={block.label}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "button-link"
                        ? { ...current, label: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Href
                </label>
                <Input
                  value={block.href}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "button-link"
                        ? { ...current, href: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Variant
                </label>
                <Select
                  value={block.variant}
                  onValueChange={(variant) =>
                    updateBlock(block.id, (current) =>
                      current.type === "button-link"
                        ? {
                            ...current,
                            variant: variant as "primary" | "secondary",
                          }
                        : current,
                    )
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {block.type === "image" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Image URL
                </label>
                <Input
                  value={block.src}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "image"
                        ? { ...current, src: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Alt text
                </label>
                <Input
                  value={block.alt}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "image"
                        ? { ...current, alt: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Caption
                </label>
                <Input
                  value={block.caption}
                  onChange={(event) =>
                    updateBlock(block.id, (current) =>
                      current.type === "image"
                        ? { ...current, caption: event.target.value }
                        : current,
                    )
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      ))}

      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4">
        <div className="mb-3 text-sm font-medium text-foreground">
          Add block
        </div>
        <div className="flex flex-wrap gap-2">
          {blockTypeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock(option.value)}>
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
