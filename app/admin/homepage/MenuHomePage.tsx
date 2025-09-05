import Link from "next/link";
import React, { memo } from "react";

const MenuHomePage: React.FC = () => {
  const links = [
    {
      title: "Image Slider",
      href: "/admin/homepage/slider",
    },
    {
      title: "Featured Products",
      href: "/admin/homepage/featured",
    },
    {
      title: "Latest Products",
      href: "/admin/homepage/latest",
    },
    {
      title: "Promotional Banners",
      href: "/admin/homepage/banners",
    },
  ];
  return (
    <ul className="flex flex-row gap-4 flex-wrap py-3 bg-slate-100 dark:bg-slate-800 justify-start rounded-md px-4 w-full">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="mb-2 hover:text-amber-300">
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default memo(MenuHomePage);
