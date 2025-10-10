"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/product/product-card";

interface Product {
  slug: string;
  [key: string]: any;
}

interface CategoryProductsProps {
  products: any[];
  initialVisibleCount?: number;
  loadMoreStep?: number;
}

const CategoryProducts: React.FC<CategoryProductsProps> = ({
  products,
  initialVisibleCount = 1,
  loadMoreStep = 8,
}) => {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [loading, setLoading] = useState(false);

  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + loadMoreStep, products.length));
      setLoading(false);
    }, 500);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.slice(0, visibleCount).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-4">
          <div className="flex flex-col items-center">
            <span className="mb-2 text-xs text-muted-foreground">
              Showing {Math.min(visibleCount, products.length)} of{" "}
              {products.length} products
            </span>
            <Button
              className="text-sm"
              onClick={handleLoadMore}
              disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProducts;
