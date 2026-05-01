import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getMyCart } from "@/lib/cart-data";
import { Cart } from "@/types";
import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import FloatingCartSheet from "./FloatingCartSheet";
import Search from "./Search";
import ToggleButton from "./ToggleButton";
import UserButton from "./UserButton";

const Menu = async () => {
  const cart = (await getMyCart()) as Cart | null;

  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ToggleButton />
        {/* <ModeToggle /> */}
        <FloatingCartSheet cart={cart} />
        <UserButton />
      </nav>
      <nav className="flex items-center gap-1 md:hidden">
        <FloatingCartSheet cart={cart} showLabel={false} />
        <Sheet>
          <SheetTrigger className="align-middle" aria-label="Open menu">
            <EllipsisVertical className="size-5" aria-hidden="true" />
          </SheetTrigger>

          <SheetContent className="flex flex-col rounded-l-lg items-start ">
            <Card className="pt-10 px-6 w-full h-full flex flex-col items-start gap-4">
              <SheetTitle className="text-2xl font-bold">User Panel</SheetTitle>
              <ToggleButton />
              <Search />
              <Button asChild variant="ghost">
                <Link href="/cart">View Cart Page</Link>
              </Button>
              <UserButton />
              <SheetDescription></SheetDescription>
            </Card>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
