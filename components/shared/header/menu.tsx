import { Button } from "@/components/ui/button";

import Link from "next/link";
import { EllipsisVertical, ShoppingCart, User } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// import UserButton from './user-button';
import ModeToggle from "./ModeToggle";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <Button asChild variant="ghost">
          <Link href="/cart">
            <ShoppingCart /> Cart
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link
            href="/user"
            className="bg-slate-900 text-slate-50 font-semibold  ">
            <User /> Sign in
          </Link>
        </Button>
        {/* <UserButton /> */}
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex w-full px-5 py-5 flex-col w-screen items-start">
            <SheetTitle>Menu</SheetTitle>
            <ModeToggle />
            <Button asChild variant="ghost">
              <Link href="/cart">
                <ShoppingCart /> Cart
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link
                href="/user"
                className="bg-slate-900 text-slate-50 font-semibold  ">
                <User /> Sign in
              </Link>
            </Button>
            {/* <UserButton /> */}
            <SheetDescription></SheetDescription>
            <SheetClose
              asChild
              className="flex-1 fixed bottom-0 left-0 right-0 w-full">
              <Button
                variant="outline"
                className="justify-center px-6 py-6 bg-slate-800 text-slate-50 font-bold   w-30 ">
                Close
              </Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
