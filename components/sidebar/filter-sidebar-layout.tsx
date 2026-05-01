"use client";

import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import React from "react";

interface HomeSidebarProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title?: string;
}

export default function FilterSidebar({
  children,
  sidebar,
  title = "Filters",
}: HomeSidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-full space-y-4 px-2">
      <div className="flex justify-end md:hidden">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setOpen(true)}>
          <SlidersHorizontal className="mr-2 size-4" />
          {title}
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base font-semibold">{title}</h2>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}>
                <X className="size-4" />
                <span className="sr-only">Close filters</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{sidebar}</div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
        <aside className="hidden md:sticky md:top-24 md:block">
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {title}
              </h2>
            </div>
            {sidebar}
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
