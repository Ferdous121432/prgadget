import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "./product-price";
import Rating from "./rating";

interface ProductCardProps {
  product: {
    slug: string;
    images: string[];
    name: string;
    brand?: string | null;
    rating?: string | number | null;
    stock: number;
    price: string | number;
    vectorScore?: number;
  };
  showVectorScore?: boolean;
}

const ProductCard = ({
  product,
  showVectorScore = false,
}: ProductCardProps) => {
  return (
    <Card className="w-full overflow-hidden max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            height={300}
            width={300}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="w-full h-full object-cover"
          />
        </Link>
      </CardHeader>
      <CardContent className="h-full grid gap-2">
        <div className="text-xs">{product.brand}</div>
        <Link href={`/product/${product.slug}`}>
          <h2 className="text-sm font-medium">{product.name}</h2>
        </Link>
        <div className="flex-between h-full flex-wrap gap-4">
          <Rating value={Number(product.rating)} />
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} />
          ) : (
            <p className="text-destructive">Out Of Stock</p>
          )}
          {showVectorScore && product.vectorScore && (
            <div className="mt-2 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">
                Relevance: {(product.vectorScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
