import Link from "next/link";
import React from "react";

export default function FooterCard({
  title,
  items,
}: {
  title: string;
  items: { id: string; name: string; link: string }[];
}) {
  return (
    <div className="flex  flex-col gap-2">
      <h1 className="text-left text-slate-900 dark:text-slate-50 font-bold uppercase tracking-wide  ">
        {title}
      </h1>
      <ul className="flex flex-col gap-1 text-left text-slate-800 dark:text-slate-100">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.link}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
