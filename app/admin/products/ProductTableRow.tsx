"use client";

import DeleteDialog from "@/components/shared/DeteleDialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { jsxToasts } from "@/lib/customToaster";
import { formatCurrency, formatId } from "@/lib/utils";
import { ProductWithIds } from "@/types";
import { Copy, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type ProductTableRowProps = {
  product: ProductWithIds;
  index: number;
  useVectorSearch: boolean;
  deleteAction: (id: string) => Promise<{ success: boolean; message: string }>;
  duplicateAction: (id: string) => Promise<{
    success: boolean;
    message: string;
    duplicatedProductId?: string;
  }>;
};

export default function ProductTableRow({
  product,
  index,
  useVectorSearch,
  deleteAction,
  duplicateAction,
}: ProductTableRowProps) {
  const router = useRouter();
  const [isDuplicating, startDuplicating] = useTransition();
  const hasOfferPrice =
    Boolean(product.offerPrice) &&
    Number(product.offerPrice) < Number(product.price);

  const openStorefrontProduct = () => {
    window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openStorefrontProduct();
    }
  };

  const handleDuplicate = () => {
    startDuplicating(async () => {
      const result = await duplicateAction(product.id);

      if (!result.success) {
        jsxToasts.errorWithIcon(
          "Could not duplicate product",
          result.message || "Something went wrong",
        );
        return;
      }

      jsxToasts.successWithIcon({
        title: "Product duplicated",
        message: result.message,
        href: result.duplicatedProductId
          ? `/admin/products/${result.duplicatedProductId}`
          : undefined,
        hrefTitle: result.duplicatedProductId ? "Edit copy" : undefined,
      });

      router.refresh();
    });
  };

  return (
    <TableRow
      className="cursor-pointer"
      onClick={openStorefrontProduct}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      title="Open product page in a new tab">
      <TableCell>{formatId(product.id)}</TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{product.name}</div>
          {/* {product.description && (
            <p className="max-w-md text-xs leading-5 text-muted-foreground">
              {getHtmlTextExcerpt(product.description, 120)}
            </p>
          )} */}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="space-y-0.5">
          <div
            className={
              hasOfferPrice ? "font-medium text-green-600" : undefined
            }>
            {formatCurrency(
              hasOfferPrice
                ? (product.offerPrice ?? product.price)
                : product.price,
            )}
          </div>
          {hasOfferPrice ? (
            <div className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </div>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-center">{product.stock}</TableCell>
      <TableCell className="text-center">{product.rating}</TableCell>
      {useVectorSearch && (
        <TableCell>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">
              {(0.9 - index * 0.1).toFixed(2)}
            </span>
          </div>
        </TableCell>
      )}
      <TableCell
        className="flex gap-1"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isDuplicating}
          onClick={handleDuplicate}>
          {isDuplicating ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Copy className="size-4" />
          )}
          Duplicate
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/products/${product.id}`}>Edit</Link>
        </Button>
        <DeleteDialog id={product.id} action={deleteAction} />
      </TableCell>
    </TableRow>
  );
}
