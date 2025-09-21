"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu, MenuIcon } from "lucide-react";

const links = [
  {
    title: "Overview",
    href: "/admin/overview",
  },
  {
    title: "Products",
    href: "/admin/products",
  },
  {
    title: "Categories",
    href: "/admin/categories",
  },
  {
    title: "Orders",
    href: "/admin/orders",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Homepage",
    href: "/admin/homepage",
  },
];

const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();
  return (
    <>
      <Drawer direction="left">
        <DrawerTrigger>
          <Button variant="outline" className="">
            <MenuIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full max-w-sm ">
          <DrawerHeader>
            {links.map((item) => (
              <DrawerTitle key={item.href} className="mb-4">
                <Link
                  href={item.href}
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname.includes(item.href)
                      ? "text-yellow-300"
                      : "text-primary "
                  )}>
                  {item.title}
                </Link>
              </DrawerTitle>
            ))}
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
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
