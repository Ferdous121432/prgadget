"use client";
import { adminAllNavItems } from "@/app/admin/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MainNav = () => {
  const pathname = usePathname();

  const activeHref =
    adminAllNavItems
      .filter(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      )
      .sort((left, right) => right.href.length - left.href.length)[0]?.href ??
    "";

  return (
    <>
      <Drawer direction="left">
        <DrawerTrigger>
          <Button variant="outline">
            <MenuIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-sm ">
          <DrawerHeader>
            {adminAllNavItems.map((item) => (
              <DrawerTitle key={item.href} className="mb-4">
                <Link
                  href={item.href}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    item.href === activeHref
                      ? "text-yellow-300"
                      : "text-primary ",
                  )}>
                  {item.title}
                </Link>
              </DrawerTitle>
            ))}
          </DrawerHeader>
          <div className="px-4 pb-6">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
      {/* <nav
        className={cn("flex items-center space-x-4 lg:space-x-6", className)}
        {...props}>
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.includes(item.href) ? "" : "text-muted-foreground"
            )}>
            {item.title}
          </Link>
        ))}
      </nav> */}
    </>
  );
};

export default MainNav;
