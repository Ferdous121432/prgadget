"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { CategoryFilter } from "./filter";

interface HomeSidebarProps {
  children: React.ReactNode | React.ReactNode[];
}

export default function FilterSidebar({ children }: HomeSidebarProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col w-full px-2 space-y-2">
      {/* header with button to toggle sidebar */}
      <div className="flex justify-end">
        <div></div>
        {/*Filter Toggle button */}
        <div
          onClick={() => setOpen(!open)}
          className="flex justify-end flex-row items-center font-semibold text-xs">
          <div className="relative w-6 h-2 flex flex-col justify-center items-center cursor-pointer">
            <div className="absolute left-0 top-2 w-6 h-[1px] bg-gray-700 rounded transition-all duration-300" />
            <div className="absolute left-0 bottom-2 w-6 h-[1px] bg-gray-700 rounded transition-all duration-300" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-700  transition-all duration-300"
              style={{
                left: open ? "16px" : "0px",
              }}
            />
          </div>
          <span className="ml-2">Filters</span>
        </div>
      </div>

      {/* sidebar content */}
      <div className="flex flex-row">
        {/* Sidebar */}
        {/* Sidebar for md and up: hidden, for smaller screens: absolute fullscreen */}
        {/* Overlay for mobile */}
        {open && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div
              className="relative bg-white dark:bg-slate-900 w-screen h-full shadow-lg z-20 flex flex-col transform transition-transform duration-1000 ease-in-out"
              style={{
                transform: open ? "translateX(0)" : "translateX(-100%)",
              }}>
              <div className="flex justify-end p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}>
                  <span className="sr-only">Close sidebar</span>×
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div>
                  <CategoryFilter />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar for md and up */}
        <div
          className={`transition-all duration-300 overflow-hidden hidden md:block ${
            open ? "w-48 opacity-100" : "w-0 opacity-0"
          }`}
          style={{ minWidth: 0 }}>
          <div className="h-full">
            {open && (
              <div>
                <CategoryFilter />
              </div>
            )}
          </div>
        </div>
        <div>
          {/* Main content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
