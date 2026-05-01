import Link from "next/link";

import { cn } from "@/lib/utils";

export type FilterOption = {
  label: string;
  href: string;
  active?: boolean;
  helperText?: string;
};

export type FilterSection = {
  title: string;
  options: FilterOption[];
  defaultOpen?: boolean;
};

export function CategoryFilter({ sections }: { sections: FilterSection[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <details
          key={section.title}
          open={section.defaultOpen ?? true}
          className="rounded-2xl border border-border bg-background px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
            {section.title}
          </summary>
          <ul className="mt-3 space-y-1.5">
            {section.options.map((option) => (
              <li key={`${section.title}-${option.label}`}>
                <Link
                  href={option.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    option.active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}>
                  <span>{option.label}</span>
                  {option.helperText ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {option.helperText}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
