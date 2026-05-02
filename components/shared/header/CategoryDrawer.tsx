"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  STATIC_NAV_CATEGORIES,
  type StaticNavCategory,
  type StaticNavSubCategory,
  type StaticNavSubSubCategory,
} from "@/lib/constants/navigation";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

function getDisplayName(name: string) {
  return name.trim();
}

function buildMainCategoryHref(category: StaticNavCategory) {
  return `/category/${category.slug}`;
}

function buildSubCategoryHref(
  category: StaticNavCategory,
  subCategory: StaticNavSubCategory,
) {
  return `/search?${new URLSearchParams({
    category: category.name,
    q: subCategory.name,
  }).toString()}`;
}

function buildSubSubCategoryHref(
  category: StaticNavCategory,
  subCategory: StaticNavSubCategory,
  subSubCategory: StaticNavSubSubCategory,
) {
  return `/search?${new URLSearchParams({
    category: category.name,
    q: `${subCategory.name} ${subSubCategory.name}`,
  }).toString()}`;
}

function NavLeaf({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <DrawerClose asChild>
      <Link
        href={href}
        className={[
          "flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}>
        <span>{label}</span>
      </Link>
    </DrawerClose>
  );
}

function ExpandIndicator({ open }: { open: boolean }) {
  return (
    <span className="text-lg font-light leading-none text-muted-foreground">
      {open ? "-" : "+"}
    </span>
  );
}

function SubCategoryBranch({
  category,
  subCategory,
}: {
  category: StaticNavCategory;
  subCategory: StaticNavSubCategory;
}) {
  const [open, setOpen] = useState(false);
  const subSubCategories = subCategory.subsubcategories ?? [];

  if (subSubCategories.length === 0) {
    return (
      <NavLeaf
        href={buildSubCategoryHref(category, subCategory)}
        label={getDisplayName(subCategory.name)}
        className="pl-6"
      />
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-3 pl-6 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
        <span>{getDisplayName(subCategory.name)}</span>
        <ExpandIndicator open={open} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 py-1">
        <NavLeaf
          href={buildSubCategoryHref(category, subCategory)}
          label={`View all ${getDisplayName(subCategory.name)}`}
          className="pl-10 text-muted-foreground"
        />
        {subSubCategories.map((subSubCategory) => (
          <NavLeaf
            key={subSubCategory.id}
            href={buildSubSubCategoryHref(
              category,
              subCategory,
              subSubCategory,
            )}
            label={getDisplayName(subSubCategory.name)}
            className="pl-10 text-muted-foreground"
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function CategoryBranch({ category }: { category: StaticNavCategory }) {
  const [open, setOpen] = useState(false);
  const subCategories = category.subcategories ?? [];

  if (subCategories.length === 0) {
    return (
      <NavLeaf
        href={buildMainCategoryHref(category)}
        label={getDisplayName(category.name)}
      />
    );
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="w-full rounded-2xl border bg-background/70">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
        <span>{getDisplayName(category.name)}</span>
        <ExpandIndicator open={open} />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-2 py-2">
        <div className="space-y-1">
          <NavLeaf
            href={buildMainCategoryHref(category)}
            label={`Shop all ${getDisplayName(category.name)}`}
          />
          {subCategories.map((subCategory) => (
            <SubCategoryBranch
              key={subCategory.id}
              category={category}
              subCategory={subCategory}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CategoryDrawer() {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button variant="outline" aria-label="Open category menu">
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[88vw] overflow-hidden border-r sm:max-w-sm">
        <DrawerHeader className="flex h-full min-h-0 flex-col gap-4">
          <DrawerTitle>Browse categories</DrawerTitle>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-left">
            {STATIC_NAV_CATEGORIES.map((category) => (
              <CategoryBranch key={category.id} category={category} />
            ))}
          </div>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
