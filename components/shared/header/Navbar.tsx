"use client";

import Link from "next/link";
import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export function Navbar({ categories }: { categories: any[] }) {
  // console.log("categories in navbar", categories);
  return (
    <div className="w-full  flex justify-center bg-stone-300 dark:bg-stone-800 ">
      <NavigationMenu className="z-10" viewport={false}>
        <NavigationMenuList>
          {categories.map((category) => (
            <NavigationMenuItem key={category.id}>
              <NavigationMenuTrigger className="capitalize bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-none">
                <Link href={`/${category.slug}`}>{category.name}</Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4 md:w-[300px] lg:w-[400px]">
                  {category.subcategories?.map((subCategory: any) => (
                    <div
                      className="font-semibold border-b-2 border-stone-400 dark:border-stone-700"
                      key={subCategory.id}>
                      <ListItem
                        title={subCategory.name}
                        href={`/category/${subCategory.slug}`}>
                        {subCategory.subsubcategories?.length > 0 && (
                          <ul className="list-none ml-4 mt-2">
                            {subCategory.subsubcategories?.map(
                              (subSubcategory: any) => (
                                <ListItem
                                  key={subSubcategory.id}
                                  title={subSubcategory.name}
                                  href={`/category/${subCategory.slug}/${subSubcategory.slug}`}></ListItem>
                              )
                            )}
                          </ul>
                        )}
                      </ListItem>
                    </div>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props} className="list-none capitalize ">
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
        </Link>
      </NavigationMenuLink>
      <>{children}</>
    </li>
  );
}
