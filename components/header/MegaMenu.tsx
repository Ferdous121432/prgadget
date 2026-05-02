"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";

export type Category = {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
};

type MegaMenuProps = {
  categories: Category[];
};

type FloatingPosition = {
  left: number;
  top: number;
  width: number;
};

type FlyoutPosition = {
  left: number;
  top: number;
  width: number;
};

const dropdownMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.18, ease: "easeOut" as const },
};

function getDisplayName(name: string) {
  return name.trim();
}

function buildCategoryHref(category: Category, parents: Category[] = []) {
  if (parents.length === 0) {
    return `/category/${category.slug}`;
  }

  const [mainCategory, ...restParents] = parents;
  const queryTrail = [...restParents, category]
    .map((item) => getDisplayName(item.name))
    .join(" ");

  return `/search?${new URLSearchParams({
    category: getDisplayName(mainCategory.name),
    q: queryTrail,
  }).toString()}`;
}

export default function MegaMenu({ categories }: MegaMenuProps) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string | null>(
    null,
  );
  const [dropdownPosition, setDropdownPosition] =
    useState<FloatingPosition | null>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<FlyoutPosition | null>(
    null,
  );
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const subCategoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const positionDropdown = (categoryId: string) => {
    const trigger = triggerRefs.current[categoryId];

    if (!trigger || typeof window === "undefined") {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 16;
    const desiredWidth = Math.min(window.innerWidth * 0.92, 320);
    const maxWidth = Math.max(280, window.innerWidth - viewportPadding * 2);
    const width = Math.min(desiredWidth, maxWidth);
    const unclampedLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(
      Math.max(unclampedLeft, viewportPadding),
      window.innerWidth - width - viewportPadding,
    );

    setDropdownPosition({
      left,
      top: rect.bottom + 12,
      width,
    });
  };

  const positionFlyout = (subCategoryId: string) => {
    const trigger = subCategoryRefs.current[subCategoryId];

    if (!trigger || typeof window === "undefined") {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 16;
    const desiredWidth = 352;
    const maxWidth = Math.max(260, window.innerWidth - viewportPadding * 2);
    const width = Math.min(desiredWidth, maxWidth);
    const rightSpace = window.innerWidth - rect.right - viewportPadding;
    const leftSpace = rect.left - viewportPadding;

    let left = rect.right - 1;

    if (rightSpace < width && leftSpace >= width) {
      left = rect.left - width + 1;
    }

    left = Math.min(
      Math.max(left, viewportPadding),
      window.innerWidth - width - viewportPadding,
    );

    setFlyoutPosition({
      left,
      top: rect.top,
      width,
    });
  };

  const clearCloseTimer = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openCategory = (category: Category) => {
    clearCloseTimer();
    setOpenCategoryId(category.id);

    const firstChildWithChildren = category.children?.find(
      (child) => (child.children?.length ?? 0) > 0,
    );

    setActiveSubCategoryId(
      firstChildWithChildren?.id ?? category.children?.[0]?.id ?? null,
    );

    positionDropdown(category.id);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenCategoryId(null);
      setActiveSubCategoryId(null);
      setDropdownPosition(null);
      setFlyoutPosition(null);
    }, 140);
  };

  useEffect(() => {
    if (!openCategoryId) {
      return;
    }

    const updatePositions = () => {
      positionDropdown(openCategoryId);

      if (activeSubCategoryId) {
        positionFlyout(activeSubCategoryId);
      }
    };

    updatePositions();
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);

    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [openCategoryId, activeSubCategoryId]);

  return (
    <nav className="relative hidden w-full justify-center border-b border-slate-200   text-slate-900 lg:flex dark:border-slate-800  dark:text-slate-50">
      <div className="relative mx-auto flex w-full max-w-[81.25rem] items-center justify-between gap-1 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] xl:px-6">
        {categories.map((category) => {
          const isOpen = openCategoryId === category.id;
          const subCategories = category.children ?? [];

          return (
            <div
              key={category.id}
              className="relative flex shrink-0"
              ref={(node) => {
                triggerRefs.current[category.id] = node;
              }}
              onMouseEnter={() => openCategory(category)}
              onMouseLeave={scheduleClose}>
              <Link
                href={buildCategoryHref(category)}
                className={[
                  "inline-flex min-h-14 items-center rounded-md px-4 py-3 transition-colors duration-150",
                  isOpen
                    ? "bg-red-600 text-slate-950 shadow-sm  dark:text-slate-50"
                    : "text-slate-700 hover:bg-slate-100 hover:text-red-700 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-red-400",
                ].join(" ")}>
                {getDisplayName(category.name)}
              </Link>

              <AnimatePresence>
                {isOpen && subCategories.length > 0 && dropdownPosition ? (
                  <motion.div
                    {...dropdownMotion}
                    className="fixed z-50"
                    style={{
                      left: dropdownPosition.left,
                      top: dropdownPosition.top,
                      width: dropdownPosition.width,
                    }}>
                    <div className="relative rounded-3xl border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_18px_60px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:shadow-[0_18px_60px_rgba(2,6,23,0.5)]">
                      <div className="mb-4 flex items-center justify-between border-b border-slate-200 px-2 pb-4 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            Browse category
                          </p>
                          <h2 className="mt-1 text-lg font-semibold normal-case tracking-normal text-slate-950 dark:text-white">
                            {getDisplayName(category.name)}
                          </h2>
                        </div>
                        <Link
                          href={buildCategoryHref(category)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 transition-colors hover:border-red-600 hover:text-red-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-500 dark:hover:text-red-400">
                          Shop all
                        </Link>
                      </div>

                      <div className="grid min-h-[18rem] grid-cols-1 gap-3">
                        <div className="rounded-2xl bg-slate-50 p-2 text-slate-950 dark:text-slate-50 font-semibold dark:bg-slate-950">
                          {subCategories.map((subCategory) => {
                            const isActive =
                              activeSubCategoryId === subCategory.id;
                            const hasChildren =
                              (subCategory.children?.length ?? 0) > 0;

                            return (
                              <div
                                key={subCategory.id}
                                className="relative"
                                ref={(node) => {
                                  subCategoryRefs.current[subCategory.id] =
                                    node;
                                }}
                                onMouseEnter={() => {
                                  clearCloseTimer();
                                  setActiveSubCategoryId(subCategory.id);
                                  positionFlyout(subCategory.id);
                                }}>
                                <Link
                                  href={buildCategoryHref(subCategory, [
                                    category,
                                  ])}
                                  className={[
                                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium normal-case tracking-normal transition-colors",
                                    isActive
                                      ? "bg-slate-700 text-red-700 shadow-sm dark:bg-slate-800 dark:text-red-400"
                                      : "text-slate-700 hover:bg-slate-100 hover:text-red-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400",
                                  ].join(" ")}>
                                  <span>
                                    {getDisplayName(subCategory.name)}
                                  </span>
                                  {hasChildren ? (
                                    <Plus className="size-4 text-slate-400 dark:text-slate-500" />
                                  ) : null}
                                </Link>

                                <AnimatePresence>
                                  {isActive && hasChildren && flyoutPosition ? (
                                    <motion.div
                                      {...dropdownMotion}
                                      className="fixed z-50"
                                      style={{
                                        left: flyoutPosition.left,
                                        top: flyoutPosition.top,
                                        width: flyoutPosition.width,
                                      }}
                                      onMouseEnter={clearCloseTimer}
                                      onMouseLeave={scheduleClose}>
                                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-[0_18px_60px_rgba(2,6,23,0.5)]">
                                        <div className="mb-3 border-b border-slate-200 pb-3 dark:border-slate-800">
                                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                                            {getDisplayName(subCategory.name)}
                                          </p>
                                        </div>
                                        <div className="space-y-1">
                                          {subCategory.children?.map(
                                            (child) => (
                                              <Link
                                                key={child.id}
                                                href={buildCategoryHref(child, [
                                                  category,
                                                  subCategory,
                                                ])}
                                                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium normal-case tracking-normal text-slate-700 transition-colors hover:bg-slate-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-red-400">
                                                <span>
                                                  {getDisplayName(child.name)}
                                                </span>
                                              </Link>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  ) : null}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
