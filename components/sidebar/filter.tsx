import * as React from "react";
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Building Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
    },
    {
      title: "Architecture",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Next.js Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      items: [
        {
          title: "Contribution Guide",
          url: "#",
        },
      ],
    },
  ],
};

export function CategoryFilter() {
  const [openFilter, setOpenFilter] = React.useState<string[]>([]);
  return (
    <div>
      {data.navMain.map((item, index) => (
        <Collapsible
          key={item.title}
          defaultOpen={index === 1}
          open={openFilter.includes(item.title)}
          onOpenChange={(open) => {
            if (open) {
              setOpenFilter((prev) => [...prev, item.title]);
            } else {
              setOpenFilter((prev) =>
                prev.filter((title) => title !== item.title)
              );
            }
          }}
          className="group/collapsible">
          <CollapsibleTrigger
            className="flex w-full items-center justify-between py-2 pr-4 text-sm font-medium hover:font-semibold"
            aria-expanded="true">
            {item.title}
            <span className="ml-2">
              <span className="sr-only">Toggle</span>
              {openFilter.includes(item.title) ? (
                <Minus size={16} />
              ) : (
                <Plus size={16} />
              )}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 pl-2 border-l border-border">
            <ul className="space-y-1">
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <a
                    href={subItem.url}
                    className="block py-1 text-sm text-muted-foreground hover:underline">
                    {subItem.title}
                  </a>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
