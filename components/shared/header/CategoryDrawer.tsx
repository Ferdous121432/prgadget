import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getFeaturedCategories } from "@/lib/actions/category.actions";
import { FeaturedCategories } from "@/types";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

type Categories = {
  category: string;
  count: number;
}[];

const CategoryDrawer = async () => {
  const { data: categories = [] } = (await getFeaturedCategories()) as any;

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline" aria-label="Open category menu">
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-sm ">
        <DrawerHeader>
          <DrawerTitle>Select a category</DrawerTitle>
          <div className="space-y-1 mt-4">
            {categories.map((x: FeaturedCategories) => (
              <Button
                variant="ghost"
                className="w-full justify-start"
                key={x.id}
                asChild>
                <DrawerClose asChild>
                  <Link href={`/search?category=${x.slug}`}>{x.name}</Link>
                </DrawerClose>
              </Button>
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryDrawer;
