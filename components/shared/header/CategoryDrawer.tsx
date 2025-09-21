import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getAllMainCategories } from "@/lib/actions/category.actions";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

type Categories = {
  category: string;
  count: number;
}[];

const CategoryDrawer = async () => {
  const { data: categories } = (await getAllMainCategories()) as any;
  // console.log("Categories:", categories);

  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MenuIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-w-sm ">
        <DrawerHeader>
          <DrawerTitle>Select a category</DrawerTitle>
          <div className="space-y-1 mt-4">
            {categories.map((x: { id: string; name: string }) => (
              <Button
                variant="ghost"
                className="w-full justify-start"
                key={x.id}
                asChild>
                <DrawerClose asChild>
                  <Link href={`/search?category=${x.id}`}>{x.name}</Link>
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
