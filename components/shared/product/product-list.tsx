import { Card, CardContent, CardTitle } from "@/components/ui/card";
import ProductCard from "./product-card";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ProductList = ({
  data,
  title,
  limit,
}: {
  data: Product[];
  title?: string;
  limit?: number;
}) => {
  const limitedData = limit ? data.slice(0, limit) : data;

  return (
    <Card className="my-10">
      <CardTitle className="flex justify-between relative ">
        <h2 className="font-xl my-0 font-bold w-full items-center text-center">
          {title}
        </h2>
        <Button asChild className="text-sm absolute top-0 right-1.5">
          <Link href="/categories/fd">View All</Link>
        </Button>
      </CardTitle>
      <CardContent>
        {data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {limitedData.map((product: any) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div>
            <p>No products found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductList;
