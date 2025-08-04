"use client";

import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { FaRegMoon } from "react-icons/fa";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { LuSunMoon } from "react-icons/lu";
import { CiSun } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { Moon, Sun, SunMoon } from "lucide-react";

const ModeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="p-2">
        <Button
          variant="ghost"
          className="focus-visible:ring-0 focus-visible: ring-offset-0 ">
          {theme === "light" ? (
            <Sun />
          ) : theme === "dark" ? (
            <Moon />
          ) : (
            <SunMoon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-2  ">
        <DropdownMenuLabel className="bg-slate-900 px-8 py-2 rounded-4xl text-slate-50 font-semibold ">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          className="flex justify-around items-center px-2 mx-auto space-x-2"
          checked={theme === "system"}
          onClick={() => setTheme("system")}>
          system
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="flex justify-around items-center px-2 mx-auto space-x-2"
          checked={theme === "light"}
          onClick={() => setTheme("light")}>
          light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="flex justify-around items-center px-2 mx-auto space-x-2"
          checked={theme === "dark"}
          onClick={() => setTheme("dark")}>
          dark
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeToggle;
