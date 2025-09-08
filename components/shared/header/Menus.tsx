import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EllipsisVertical, ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserButton from "./UserButton";
import ModeToggle from "./ModeToggle";
import ToggleButton from "./ToggleButton";
import { Card } from "@/components/ui/card";
import Search from "./Search";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ToggleButton />
        {/* <ModeToggle /> */}
        <Button asChild variant="ghost">
          <Link href="/cart">
            <ShoppingCart /> Cart
          </Link>
        </Button>
        <UserButton />
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>

          <SheetContent className="flex flex-col rounded-l-lg items-start ">
            <Card className="pt-10 px-6 w-full h-full flex flex-col items-start gap-4">
              <SheetTitle className="text-2xl font-bold">User Panel</SheetTitle>
              <ToggleButton />
              <Search />
              <Button asChild variant="ghost">
                <Link href="/cart">
                  <ShoppingCart /> Cart
                </Link>
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
