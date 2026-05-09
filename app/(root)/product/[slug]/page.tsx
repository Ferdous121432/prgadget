import { auth } from "@/auth";
import AddToCart from "@/components/shared/product/add-to-cart";
import ProductDescriptionContent from "@/components/shared/product/product-description-content";
import ProductImages from "@/components/shared/product/product-images";
import ProductPrice from "@/components/shared/product/product-price";
import Rating from "@/components/shared/product/rating";
import RelativeProducts from "@/components/shared/product/relative-products";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { getMyCart } from "@/lib/cart-data";
import { productSpecificationSections } from "@/lib/product-specifications";
import { Cart } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReviewList from "./ReviewList";

// Force dynamic rendering since we use cookies and session data
export const dynamic = "force-dynamic";

function getSpecificationValue(
  specifications: unknown,
  sectionKey: string,
  fieldKey: string,
) {
  if (
    !specifications ||
    typeof specifications !== "object" ||
    Array.isArray(specifications)
  ) {
    return "";
  }

  const section = (specifications as Record<string, unknown>)[sectionKey];
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    return "";
  }

  const value = (section as Record<string, unknown>)[fieldKey];
  return typeof value === "string" ? value.trim() : "";
}

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;

  const productData = await getProductBySlug(slug);
  if (!productData) {
    return notFound();
  }

  const product = productData;

  const session = await auth();
  const userId = session?.user?.id;

  //TODO: solve any issues with cart
  const cart = (await getMyCart()) as Cart;
  const regularPrice = Number(product.price);
  const parsedOfferPrice = product.offerPrice
    ? Number(product.offerPrice)
    : null;
  const hasActiveOffer =
    parsedOfferPrice !== null &&
    Number.isFinite(parsedOfferPrice) &&
    parsedOfferPrice > 0 &&
    parsedOfferPrice < regularPrice;
  const effectivePrice = hasActiveOffer ? parsedOfferPrice : regularPrice;
  const discountPercent = hasActiveOffer
    ? Math.round(((regularPrice - effectivePrice) / regularPrice) * 100)
    : 0;
  const brandHref = product.brand
    ? `/search?${new URLSearchParams({ brand: product.brand }).toString()}`
    : null;
  const specificationSections = productSpecificationSections
    .map((section) => ({
      ...section,
      entries: section.fields
        .map((field) => ({
          ...field,
          value: getSpecificationValue(
            product.specifications,
            section.key,
            field.key,
          ),
        }))
        .filter((field) => Boolean(field.value)),
    }))
    .filter((section) => section.entries.length > 0);
  const hasSpecifications = specificationSections.length > 0;
  const hasDescription = Boolean(product.description);
  const detailsDefaultTab = hasSpecifications
    ? "specifications"
    : hasDescription
      ? "description"
      : "reviews";

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Images Column */}
          <div className="col-span-2">
            <ProductImages images={product.images} />
          </div>
          {/* Details Column */}
          <div className="col-span-2 p-5">
            <div className="flex flex-col gap-6">
              {brandHref ? (
                <Link
                  href={brandHref}
                  className="w-fit text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  {product.brand}
                </Link>
              ) : null}
              <h1 className="h3-bold">{product.name}</h1>
              <Rating value={Number(product.rating)} />
              <p>{product.numReviews} reviews</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <ProductPrice
                  value={effectivePrice}
                  className=" rounded-full bg-green-100 text-green-700 px-5 py-2"
                />
                {hasActiveOffer ? (
                  <>
                    <ProductPrice
                      value={regularPrice}
                      className="text-lg text-muted-foreground line-through"
                    />
                    <Badge variant="secondary">{discountPercent}% OFF</Badge>
                  </>
                ) : null}
              </div>
              {product.shortDescription ? (
                <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 text-sm">
                  <ProductDescriptionContent
                    source={product.shortDescription}
                  />
                </div>
              ) : null}
            </div>
          </div>
          {/* Action Column */}
          <div>
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex justify-between">
                  <div>Price</div>
                  <div className="text-right">
                    <ProductPrice
                      value={effectivePrice}
                      className={hasActiveOffer ? "text-green-700" : undefined}
                    />
                    {hasActiveOffer ? (
                      <ProductPrice
                        value={regularPrice}
                        className="text-sm text-muted-foreground line-through"
                      />
                    ) : null}
                  </div>
                </div>
                {hasActiveOffer ? (
                  <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                    <div>You save</div>
                    <div>{discountPercent}%</div>
                  </div>
                ) : null}
                <div className="mb-2 flex justify-between">
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge variant="outline">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out Of Stock</Badge>
                  )}
                </div>
                {product.stock > 0 && (
                  <div className="flex-center">
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: effectivePrice.toFixed(2),
                        quantity: 1,
                        image: product.images![0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="mt-10">
        <Tabs defaultValue={detailsDefaultTab} className="w-full gap-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl p-1">
            {hasSpecifications ? (
              <TabsTrigger
                className="flex-none px-4 py-2"
                value="specifications">
                Specifications
              </TabsTrigger>
            ) : null}
            {hasDescription ? (
              <TabsTrigger className="flex-none px-4 py-2" value="description">
                Description
              </TabsTrigger>
            ) : null}
            <TabsTrigger className="flex-none px-4 py-2" value="reviews">
              Reviews
            </TabsTrigger>
          </TabsList>

          {hasSpecifications ? (
            <TabsContent value="specifications">
              <div className="space-y-6">
                {specificationSections.map((section) => (
                  <Card key={section.key}>
                    <CardContent className="p-0">
                      <div className="border-b px-5 py-4">
                        <h3 className="text-lg font-semibold">
                          {section.title}
                        </h3>
                      </div>
                      <div className="divide-y">
                        {section.entries.map((entry) => (
                          <div
                            key={`${section.key}.${entry.key}`}
                            className="grid gap-3 px-5 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="text-sm font-medium text-muted-foreground">
                              {entry.label}
                            </div>
                            <div className="text-sm whitespace-pre-line wrap-break-word">
                              {entry.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ) : null}

          {hasDescription ? (
            <TabsContent value="description">
              <Card>
                <CardContent className="p-6">
                  <ProductDescriptionContent source={product.description} />
                </CardContent>
              </Card>
            </TabsContent>
          ) : null}

          <TabsContent value="reviews">
            <ReviewList
              userId={userId || ""}
              productId={product.id}
              productSlug={product.slug}
            />
          </TabsContent>
        </Tabs>
      </section>

      <section className="mt-10">
        <RelativeProducts
          productId={product.id}
          mainCategoryId={product.mainCategoryId}
          subCategoryId={product.subCategoryId}
          subSubCategoryId={product.subSubCategoryId}
          brand={product.brand}
        />
        <Badge variant="outline" className="mt-4 ml-2" asChild>
          <Link href="/">Back To Home</Link>
        </Badge>
      </section>
    </>
  );
};

export default ProductDetailsPage;
