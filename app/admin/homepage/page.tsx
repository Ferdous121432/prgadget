import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllHomeSliders } from "@/lib/actions/homepage.actions";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
import { requireAdmin } from "@/lib/auth-guard";
import {
  featuredBrands,
  featuredCategoryLogos,
  categories as storefrontDepartments,
} from "@/lib/constants";
import { formatCurrency, formatId } from "@/lib/utils";
import { ProductWithId } from "@/types";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  ImagePlus,
  LayoutPanelTop,
  PackagePlus,
  Sparkles,
  Store,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Homepage",
};

type HomeSlider = {
  id: string;
  image_url: string;
  linked_url: string;
  image_name: string;
};

const homepageSections = [
  {
    title: "Hero carousel",
    description:
      "Lead the homepage with live slider creative and destination links.",
    href: "/admin/homepage/create-slider",
    cta: "Add slide",
  },
  {
    title: "Latest drops rail",
    description:
      "Keep new arrivals feeling fresh so the homepage always has movement.",
    href: "/admin/products/create",
    cta: "Add product",
  },
  {
    title: "Seasonal standouts",
    description:
      "Promote featured products with stronger visual priority on the storefront.",
    href: "/admin/products",
    cta: "Manage featured",
  },
  {
    title: "Brand and category discovery",
    description:
      "Support the product story with curated category and brand entry points.",
    href: "/admin/categories",
    cta: "Organize taxonomy",
  },
];

const AdminHomePage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
  }>;
}) => {
  await requireAdmin();

  await props.searchParams;

  const [slidersRaw, featuredProductsRaw, latestProductsRaw] =
    await Promise.all([
      getAllHomeSliders(),
      getFeaturedProducts(),
      getLatestProducts(),
    ]);

  const sliders = (slidersRaw as HomeSlider[]) ?? [];
  const featuredProducts = (featuredProductsRaw as ProductWithId[]) ?? [];
  const latestProducts = (latestProductsRaw as ProductWithId[]) ?? [];
  const heroSlide = sliders[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="h2-bold">Homepage Merchandising</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Control the storefront homepage using the same merchandising rhythm
            as the public landing page: hero, curated rails, category entry
            points, and brand discovery.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/">Preview storefront</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Manage products</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/homepage/create-slider">Create slider</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hero Slides</CardTitle>
            <ImagePlus className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sliders.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Live homepage creatives currently available for the hero carousel.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Rail</CardTitle>
            <Sparkles className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredProducts.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Products currently powering the seasonal standout section.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Drops</CardTitle>
            <PackagePlus className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestProducts.length}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Newest products surfaced on the homepage arrival rail.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Discovery Blocks
            </CardTitle>
            <LayoutPanelTop className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {featuredCategoryLogos.length + featuredBrands.length}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Category and brand entry points supporting lower-fold navigation.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Hero Carousel Control</CardTitle>
              <CardDescription>
                This is the top of the public homepage. Prioritize strongest
                creative, clean destination URLs, and campaign order.
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/homepage/create-slider">Add new slide</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {heroSlide ? (
              <div className="overflow-hidden rounded-2xl border">
                <div className="relative aspect-[16/7] w-full bg-muted">
                  <Image
                    src={heroSlide.image_url}
                    alt={heroSlide.image_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">Current lead slide</p>
                    <p className="text-xs text-muted-foreground">
                      {heroSlide.image_name}  {heroSlide.linked_url}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{formatId(heroSlide.id)}</Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={heroSlide.linked_url}>Open destination</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No hero slides yet. Create one to replace the fallback
                storefront hero.
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SLIDE</TableHead>
                  <TableHead>DESTINATION</TableHead>
                  <TableHead className="text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sliders.length > 0 ? (
                  sliders.slice(0, 4).map((slider) => (
                    <TableRow key={slider.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{slider.image_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatId(slider.id)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate">
                        {slider.linked_url}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={slider.linked_url}>Preview</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground">
                      Add slides to control the live hero carousel.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Homepage Sections</CardTitle>
            <CardDescription>
              Direct controls for the same section flow used on the storefront
              home page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {homepageSections.map((section) => (
              <div key={section.title} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="text-xs leading-6 text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={section.href}>{section.cta}</Link>
                  </Button>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Store className="size-4" />
                Storefront preview routine
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                Use the public homepage preview after each merchandising update
                to verify hero sequencing, rail freshness, and lower-fold
                discovery balance.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/">
                  Open live homepage
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full gap-4 xl:flex xl:flex-row">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Featured Products Rail</CardTitle>
              <CardDescription>
                Products currently surfaced as the homepage seasonal standout
                section.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/products">Manage products</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price)}  stock {product.stock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/product/${product.slug}`}>View</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No featured products are set. Flag products as featured to
                populate this rail.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Latest Drops Rail</CardTitle>
              <CardDescription>
                The newest products driving the new-arrivals section on the
                homepage.
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/products/create">Add product</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price)}  stock {product.stock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/product/${product.slug}`}>View</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Add products to keep the latest-drops section active.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:flex">
        <Card className="xl:col-span-6">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Trending Categories</CardTitle>
              <CardDescription>
                Category spots mirrored from the storefront discovery section.
              </CardDescription>
            </div>
            <Badge variant="outline">{featuredCategoryLogos.length} live</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {featuredCategoryLogos.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-2xl border p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border bg-white">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium capitalize">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      /{category.link}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/category/${category.link}`}>Preview</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-6">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Brand Rooms</CardTitle>
              <CardDescription>
                Brand discovery options used in the lower homepage brand
                section.
              </CardDescription>
            </div>
            <Badge variant="outline">{featuredBrands.length} brands</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {featuredBrands.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center justify-between rounded-2xl border p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border bg-white">
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">
                      /{brand.link}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/search?brand=${brand.link}`}>Preview</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Structure Reference</CardTitle>
          <CardDescription>
            A quick operational view of the public homepage flow this admin
            screen supports.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BadgeDollarSign className="size-4" />
              Hero + campaign intro
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Slider first, then supporting campaign cards and department
              momentum.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Boxes className="size-4" />
              Category discovery
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Trending categories and fast-entry taxonomy blocks for core
              departments.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4" />
              Product rails
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Latest drops and featured picks do the heavy lifting for
              conversion.
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Store className="size-4" />
              Lower-fold brand support
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              Brand rooms and editorial-style discovery keep the page from
              feeling flat.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Storefront Department Links</CardTitle>
            <CardDescription>
              Quick links to the main departments referenced in the homepage
              flow.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/categories">Manage categories</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {storefrontDepartments.slice(0, 8).map((department) => (
            <Link
              key={department.id}
              href={`/category/${department.url}`}
              className="flex items-center justify-between rounded-2xl border p-4 text-sm font-medium transition hover:border-foreground/30 hover:bg-muted/30">
              <span>{department.name}</span>
              <ArrowRight className="size-4" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHomePage;
