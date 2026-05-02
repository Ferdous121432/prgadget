"use client";

import DeleteDialog from "@/components/shared/DeteleDialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, formatId } from "@/lib/utils";
import { ProductWithIds } from "@/types";
import Link from "next/link";

type ProductTableRowProps = {
  product: ProductWithIds;
  index: number;
  useVectorSearch: boolean;
  deleteAction: (id: string) => Promise<{ success: boolean; message: string }>;
};

export default function ProductTableRow({
  product,
  index,
  useVectorSearch,
  deleteAction,
}: ProductTableRowProps) {
  const openStorefrontProduct = () => {
    window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openStorefrontProduct();
    }
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
        {formatCurrency(product.price)}
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
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/products/${product.id}`}>Edit</Link>
        </Button>
        <DeleteDialog id={product.id} action={deleteAction} />
      </TableCell>
    </TableRow>
  );
}
