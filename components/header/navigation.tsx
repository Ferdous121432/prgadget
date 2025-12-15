// TODO: Template for Navigation-popup. Change Flyout Links according to the project requirements.

import React from "react";
import FlyoutLink from "./flyout-link";
import { categories } from "@/lib/constants";

export default function Navigation() {
  return (
    <div className="relative flex w-screen justify-center bg-slate-200 px-4  text-slate-900 shadow-xl">
      {/* <MaxWidth81> */}
      <div className="hidden w-full max-w-[81.25rem] items-center text-xs justify-between px-10 py-4 font-semibold uppercase lg:flex">
        {categories.map((category, index) => (
          <div className="flex items-center justify-center" key={index}>
            <FlyoutLink
              key={index}
              link={category.url}
              flyoutContent={category.name}
              // lastChild={index === categories.length - 1}
            >
              {category.name}
            </FlyoutLink>
          </div>
        ))}
      </div>
      {/* </MaxWidth81> */}
    </div>
  );
}
